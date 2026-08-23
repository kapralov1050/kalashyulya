/**
 * GET /api/payments/yookassa/:id — получение статуса платежа в YooKassa.
 * Используется страницей /shop/payment-success, чтобы не доверять
 * локальному order.status (заказ создаётся ДО оплаты).
 *
 * Query:
 *   - test=1 — принудительно test-mode (используется в development)
 *   - по умолчанию test-mode определяется из Origin/Referer/env (см. getYookassaCredentials)
 *
 * Возвращает:
 *   { success: true, paymentId, status, paid, amount, currency } — при успехе
 *   { success: false, status: 'not_found' } — если платёж не найден в YooKassa
 */
/* eslint-disable no-console */
import * as v from 'valibot'
import {
  buildYookassaAuthHeader,
  getYookassaCredentials,
} from '../../../utils/yookassaPayment'

const QuerySchema = v.object({
  test: v.optional(v.union([v.literal('0'), v.literal('1')])),
})

export default defineEventHandler(async (event) => {
  const paymentId = getRouterParam(event, 'id')
  if (!paymentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'paymentId is required',
    })
  }

  const rawQuery = getQuery(event) || {}
  const parsed = v.safeParse(QuerySchema, rawQuery)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query',
      data: parsed.issues,
    })
  }

  const headersObj = (event.headers ?? {}) as unknown as Record<string, string | undefined>
  // Если явно запрошен test=1 — отключаем Origin-based detection,
  // чтобы из production-origin можно было посмотреть статус test-платежа.
  let credentials: { shopId: string, secretKey: string, isTestMode: boolean }
  if (parsed.output.test === '1') {
    const shopId = process.env.YOOKASSA_SHOP_ID_TEST
    const secretKey = process.env.YOOKASSA_SECRET_KEY_TEST
    if (!shopId || !secretKey) {
      throw createError({ statusCode: 500, statusMessage: 'Payment service not configured' })
    }
    credentials = { shopId, secretKey, isTestMode: true }
  } else {
    credentials = getYookassaCredentials(headersObj)
  }
  const { shopId, secretKey, isTestMode } = credentials

  try {
    const payment = await $fetch<{
      id: string
      status: string
      paid: boolean
      amount: { value: string, currency: string }
    }>(`https://api.yookassa.ru/v3/payments/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: {
        Authorization: buildYookassaAuthHeader(shopId, secretKey),
      },
    })

    console.log(`[yookassa] status check id=${paymentId} status=${payment.status} testMode=${isTestMode}`)

    return {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      paid: payment.paid,
      amount: payment.amount.value,
      currency: payment.amount.currency,
    }
  } catch (error: unknown) {
    const fetchError = error as { status?: number, statusCode?: number, response?: { status?: number } }
    const statusCode = fetchError?.status ?? fetchError?.statusCode ?? fetchError?.response?.status
    if (statusCode === 404) {
      console.log(`[yookassa] status check id=${paymentId} not_found`)
      return {
        success: true,
        status: 'not_found',
        paymentId,
      }
    }
    console.error(`[yookassa] status check error id=${paymentId} status=${statusCode ?? 'unknown'}`)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to check payment status',
    })
  }
})