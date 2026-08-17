/**
 * POST /api/payments/yookassa — создание платежа в YooKassa.
 * Используется console.log/error для диагностики (legacy Yandex-формат).
 */
/* eslint-disable no-console */
import * as v from 'valibot'
import {
  buildYookassaAuthHeader,
  buildYookassaPaymentPayload,
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
})

// Legacy: Yandex Cloud Function определял test-mode по Origin/Referer из
// ['localhost', '127.0.0.1', 'kalashyulya.vercel.app']. Поддерживаем оба пути:
//   1. env YOOKASSA_TEST_MODE=true — явный override (наш существующий путь)
//   2. Origin/Referer содержит legacy test-origin — обратная совместимость
const TEST_ORIGINS = ['localhost', '127.0.0.1', 'kalashyulya.vercel.app', 'localhost:3000', 'localhost:4000']

function isTestEnvironment(headers: Record<string, string | undefined>): boolean {
  const origin = headers.origin || headers.referer || ''
  return TEST_ORIGINS.some(host => origin.includes(host))
}

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

  // Test mode из env ИЛИ по Origin (back-compat с Yandex).
  const headersObj = (event.headers ?? {}) as unknown as Record<string, string | undefined>
  const isTestMode = process.env.YOOKASSA_TEST_MODE === 'true'
    || isTestEnvironment(headersObj)

  const shopId = isTestMode
    ? process.env.YOOKASSA_SHOP_ID_TEST
    : process.env.YOOKASSA_SHOP_ID
  const secretKey = isTestMode
    ? process.env.YOOKASSA_SECRET_KEY_TEST
    : process.env.YOOKASSA_SECRET_KEY

  const origin = headersObj.origin || '—'
  console.log(`[yookassa] mode=${isTestMode ? 'TEST' : 'PROD'} origin=${origin} orderId=${body.orderId}`)

  if (!shopId || !secretKey) {
    console.error(`[yookassa] credentials not configured for ${isTestMode ? 'test' : 'prod'} mode`)
    throw createError({
      statusCode: 500,
      statusMessage: 'Payment service not configured',
    })
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