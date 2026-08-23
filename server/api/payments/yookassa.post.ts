/**
 * POST /api/payments/yookassa — создание платежа в YooKassa.
 * Используется console.log/error для диагностики (legacy Yandex-формат).
 */
/* eslint-disable no-console */
import * as v from 'valibot'
import {
  buildYookassaAuthHeader,
  buildYookassaPaymentPayload,
  cancelPreviousPayment,
  getYookassaCredentials,
  type CreatePaymentBody,
  type YooKassaPayment,
} from '../../utils/yookassaPayment'

const BodySchema = v.object({
  orderId: v.pipe(v.string(), v.minLength(1)),
  amount: v.pipe(v.number(), v.minValue(1)),
  description: v.pipe(v.string(), v.minLength(1)),
  returnUrl: v.pipe(v.string(), v.url()),
  currency: v.optional(v.string(), 'RUB'),
  customer: v.object({
    email: v.pipe(v.string(), v.email()),
    phone: v.optional(v.string()),
  }),
  // При retry — id предыдущего pending-платежа, который нужно отменить
  // перед созданием нового. Не отправляется при первом создании.
  // Trim + minLength защищает от мусорных ID (пустая строка / пробелы),
  // которые иначе привели бы к GET-у в ЮKassa с некорректным URL.
  retryPaymentId: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1))),
})

// Логика определения test/prod mode и credentials вынесена в getYookassaCredentials()
// (server/utils/yookassaPayment.ts) — общий хелпер для POST и GET.

export default defineEventHandler(async (event) => {
  const raw = await readBody(event)
  const parsed = v.safeParse(BodySchema, raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or missing request body',
      data: parsed.issues,
    })
  }
  const body = parsed.output as CreatePaymentBody

  const headersObj = (event.headers ?? {}) as unknown as Record<string, string | undefined>
  let credentials: { shopId: string, secretKey: string, isTestMode: boolean }
  try {
    credentials = getYookassaCredentials(headersObj)
  } catch (err) {
    console.error(`[yookassa] credentials not configured: ${(err as Error).message}`)
    throw err
  }
  const { shopId, secretKey, isTestMode } = credentials

  const origin = headersObj.origin || '—'
  console.log(`[yookassa] mode=${isTestMode ? 'TEST' : 'PROD'} origin=${origin} orderId=${body.orderId}`)

  // Retry-flow: при наличии retryPaymentId проверяем его в ЮKassa и отменяем
  // pending-платёж, прежде чем создавать новый. Без этого в ЮKassa будут
  // висеть мёртвые pending-платежи (ЮKassa не отменяет их автоматически
  // при уходе пользователя — только по таймауту срока жизни ~30 мин).
  if (body.retryPaymentId) {
    await cancelPreviousPayment(body.retryPaymentId, { shopId, secretKey, isTestMode })
  }

  // Legacy idempotence key: Yandex слал `test_<orderId>_<ts>` в test mode,
  // `<orderId>_<ts>` в prod. Сохраняем формат.
  const idempotenceKey = `${isTestMode ? 'test_' : ''}${body.orderId}_${Date.now()}`

  let payment: YooKassaPayment
  try {
    payment = await $fetch<YooKassaPayment>('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        Authorization: buildYookassaAuthHeader(shopId, secretKey),
      },
      body: buildYookassaPaymentPayload(body, { isTestMode }),
    })
  }
  catch (error: unknown) {
    console.error('[yookassa] API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create payment',
    })
  }

  console.log(`[yookassa] payment created id=${payment.id} status=${payment.status}`)

  // Legacy response shape: {success, paymentId, confirmationUrl, status}
  return {
    success: true,
    paymentId: payment.id,
    confirmationUrl: payment.confirmation.confirmation_url ?? '',
    status: payment.status,
  }
})