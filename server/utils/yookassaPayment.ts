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

export function buildYookassaAuthHeader(
  shopId: string,
  secret: string,
): string {
  return 'Basic ' + Buffer.from(`${shopId}:${secret}`).toString('base64')
}

export function buildYookassaPaymentPayload(body: CreatePaymentBody) {
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
      order_id: body.orderId,
      customer_email: body.customer.email,
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
