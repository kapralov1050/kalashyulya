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

export default defineEventHandler(async event => {
  const raw = await readBody(event)
  const parsed = v.safeParse(BodySchema, raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid payment request',
      data: parsed.issues,
    })
  }
  const body = parsed.output as CreatePaymentBody

  // Test mode переключает между test- и prod-credentials.
  // Test-режим использовать ТОЛЬКО в dev/preview окружениях для ручного тестирования.
  // В prod (VPS) переменная должна быть не задана или = 'false'.
  const isTestMode = process.env.YOOKASSA_TEST_MODE === 'true'
  const shopId = isTestMode
    ? process.env.YOOKASSA_SHOP_ID_TEST
    : process.env.YOOKASSA_SHOP_ID
  const secret = isTestMode
    ? process.env.YOOKASSA_SECRET_KEY_TEST
    : process.env.YOOKASSA_SECRET_KEY

  if (!shopId || !secret) {
    throw createError({
      statusCode: 500,
      statusMessage: `Yookassa credentials not configured (${isTestMode ? 'TEST' : 'PROD'} mode)`,
    })
  }

  const idempotenceKey = `${body.orderId}-${Date.now()}`
  const payment = await $fetch<YooKassaPayment>(
    'https://api.yookassa.ru/v3/payments',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        Authorization: buildYookassaAuthHeader(shopId, secret),
      },
      body: buildYookassaPaymentPayload(body),
    },
  )

  return {
    success: true,
    paymentId: payment.id,
    confirmationUrl: payment.confirmation.confirmation_url ?? '',
  }
})
