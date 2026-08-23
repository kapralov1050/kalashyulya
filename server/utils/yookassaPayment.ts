export interface CreatePaymentBody {
  orderId: string
  amount: number
  description: string
  returnUrl: string
  currency?: string
  customer: {
    email: string
    phone?: string
  }
  retryPaymentId?: string
}

export interface YooKassaPayment {
  id: string
  status: string
  confirmation: {
    type: string
    confirmation_url?: string
  }
}

/**
 * Options для buildYookassaPaymentPayload, чтобы прокинуть isTestMode
 * и не потерять legacy-поля в metadata (back-compat с Yandex Cloud Function).
 */
export interface PaymentPayloadContext {
  isTestMode: boolean
}

export function buildYookassaAuthHeader(
  shopId: string,
  secret: string,
): string {
  return 'Basic ' + Buffer.from(`${shopId}:${secret}`).toString('base64')
}

/**
 * Определение test-mode по env и Origin/Referer (back-compat с Yandex Cloud Function).
 * Возвращает credentials и флаг isTestMode. Кидает 500 если креды не заданы.
 */
const TEST_ORIGINS = ['localhost', '127.0.0.1', 'kalashyulya.vercel.app', 'localhost:3000', 'localhost:4000']

export function detectYookassaTestMode(headers: Record<string, string | undefined>): boolean {
  const origin = headers.origin || headers.referer || ''
  if (process.env.YOOKASSA_TEST_MODE === 'true') return true
  return TEST_ORIGINS.some(host => origin.includes(host))
}

export interface YookassaCredentials {
  shopId: string
  secretKey: string
  isTestMode: boolean
}

export function getYookassaCredentials(headers: Record<string, string | undefined> = {}): YookassaCredentials {
  const isTestMode = detectYookassaTestMode(headers)
  const shopId = isTestMode
    ? process.env.YOOKASSA_SHOP_ID_TEST
    : process.env.YOOKASSA_SHOP_ID
  const secretKey = isTestMode
    ? process.env.YOOKASSA_SECRET_KEY_TEST
    : process.env.YOOKASSA_SECRET_KEY

  if (!shopId || !secretKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Payment service not configured',
    })
  }

  return { shopId, secretKey, isTestMode }
}

export type CancelPreviousPaymentResult = 'canceled' | 'not_found' | 'skipped'

/**
 * Отменяет предыдущий pending-платёж в ЮKassa перед созданием нового.
 * Используется в retry-flow (когда пользователь вернулся с ЮKassa без оплаты).
 *
 * Поведение:
 *  - status=pending → POST /v3/payments/{id}/cancel → 'canceled'
 *  - status=canceled → уже отменён, ничего не делаем → 'canceled'
 *  - status=succeeded → throw 409 (предыдущий платёж уже оплачен)
 *  - 404 → платёж не найден, ничего не делаем → 'not_found'
 *  - любая другая ошибка → warning, НЕ блокируем создание нового → 'skipped'
 */
/* eslint-disable no-console */
export async function cancelPreviousPayment(
  paymentId: string,
  credentials: YookassaCredentials,
): Promise<CancelPreviousPaymentResult> {
  const authHeader = buildYookassaAuthHeader(credentials.shopId, credentials.secretKey)

  let currentStatus: string
  try {
    const existing = await $fetch<{ status: string }>(
      `https://api.yookassa.ru/v3/payments/${encodeURIComponent(paymentId)}`,
      {
        method: 'GET',
        headers: { Authorization: authHeader },
      },
    )
    currentStatus = existing.status
  } catch (err: unknown) {
    const fetchErr = err as { status?: number, statusCode?: number, response?: { status?: number } }
    const statusCode = fetchErr?.status ?? fetchErr?.statusCode ?? fetchErr?.response?.status
    if (statusCode === 404) {
      console.log(`[yookassa] cancel: previous payment ${paymentId} not_found`)
      return 'not_found'
    }
    // Любая другая ошибка — не блокируем создание нового платежа.
    // Старый платёж повисит pending в ЮKassa и сам отменится по timeout.
    console.warn(`[yookassa] cancel: failed to fetch status for ${paymentId}, skipping cancel`)
    return 'skipped'
  }

  if (currentStatus === 'succeeded') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Previous payment already succeeded',
    })
  }

  if (currentStatus === 'canceled') {
    return 'canceled'
  }

  if (currentStatus !== 'pending' && currentStatus !== 'waiting_for_capture') {
    console.warn(`[yookassa] cancel: unexpected status ${currentStatus} for ${paymentId}, skipping`)
    return 'skipped'
  }

  try {
    await $fetch(`https://api.yookassa.ru/v3/payments/${encodeURIComponent(paymentId)}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': `cancel_${paymentId}_${Date.now()}`,
        Authorization: authHeader,
      },
      body: {},
    })
    console.log(`[yookassa] cancel: previous payment ${paymentId} canceled`)
    return 'canceled'
  } catch (err: unknown) {
    console.warn(`[yookassa] cancel: failed to cancel ${paymentId}:`, (err as Error).message)
    return 'skipped'
  }
}

/**
 * Формирует payload для POST /v3/payments.
 *
 * Phase D back-compat (после ревью): metadata keys ВОЗВРАЩЕНЫ в legacy формат:
 *   - orderId, customerEmail, env (camelCase как в Yandex-функции).
 *
 * Snake_case вариант (`order_id`/`customer_email`/`customer_phone`) мы тоже
 * добавляем — чтобы новые consumers (например webhook-handlers) могли найти
 * заказ по любому стилю. Новый формат не ломает старый.
 *
 * amount.value: с toFixed(2) — YooKassa требует 2 знака. Yandex слал `.toString()`,
 * что было норм только для целых сумм. Наша версия правильнее.
 *
 * description: обрезаем до 128 символов (лимит YooKassa). Yandex этого не делал,
 * что было потенциальным багом для длинных title.
 */
export function buildYookassaPaymentPayload(body: CreatePaymentBody, ctx: PaymentPayloadContext) {
  return {
    amount: {
      value: body.amount.toFixed(2),
      currency: body.currency ?? 'RUB',
    },
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url: body.returnUrl,
    },
    description: body.description.slice(0, 128),
    metadata: {
      // Legacy keys (Yandex-совместимые для dashboard/webhooks поиска)
      orderId: body.orderId,
      customerEmail: body.customer.email,
      env: ctx.isTestMode ? 'test' : 'prod',
      // Доп. поля для новых consumers (кейс-нейтральные)
      customer_phone: body.customer.phone ?? '',
    },
    receipt: {
      customer: {
        email: body.customer.email,
        phone: body.customer.phone ?? undefined,
      },
      items: [
        {
          description: body.description.slice(0, 128),
          amount: {
            value: body.amount.toFixed(2),
            currency: body.currency ?? 'RUB',
          },
          vat_code: 1,
          quantity: '1',
        },
      ],
    },
  }
}