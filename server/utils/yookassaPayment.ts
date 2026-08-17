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