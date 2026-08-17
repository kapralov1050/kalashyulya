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

  const shopId = process.env.NUXT_YOOKASSA_SHOP_ID
  const secret = process.env.NUXT_YOOKASSA_SECRET
  if (!shopId || !secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Yookassa credentials not configured',
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
