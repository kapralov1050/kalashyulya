import { describe, expect, it } from 'vitest'
import {
  buildYookassaAuthHeader,
  buildYookassaPaymentPayload,
} from '../../../utils/yookassaPayment'

describe('POST /api/payments/yookassa — request shape', () => {
  it('строит корректный Basic Auth header', () => {
    const header = buildYookassaAuthHeader('shop123', 'secret456')
    expect(header.startsWith('Basic ')).toBe(true)
    const decoded = Buffer.from(header.replace('Basic ', ''), 'base64').toString()
    expect(decoded).toBe('shop123:secret456')
  })

  it('строит payload с валютой RUB по умолчанию и обрезает description до 128 символов', () => {
    const longDescription = 'A'.repeat(200)
    const payload = buildYookassaPaymentPayload({
      orderId: 'order_1',
      amount: 1500.5,
      description: longDescription,
      returnUrl: 'https://example.com/return',
      customer: { email: 'a@b.com' },
    })
    expect(payload.amount).toEqual({ value: '1500.50', currency: 'RUB' })
    expect(payload.capture).toBe(true)
    expect(payload.confirmation).toEqual({
      type: 'redirect',
      return_url: 'https://example.com/return',
    })
    expect(payload.description).toHaveLength(128)
    expect(payload.metadata).toEqual({
      order_id: 'order_1',
      customer_email: 'a@b.com',
      customer_phone: '',
    })
    expect(payload.receipt.customer).toEqual({
      email: 'a@b.com',
      phone: undefined,
    })
    expect(payload.receipt.items[0]).toMatchObject({
      amount: { value: '1500.50', currency: 'RUB' },
      vat_code: 1,
      quantity: '1',
    })
  })

  it('использует переданную валюту, если указана', () => {
    const payload = buildYookassaPaymentPayload({
      orderId: 'order_2',
      amount: 100,
      description: 'Тест',
      returnUrl: 'https://example.com/return',
      currency: 'USD',
      customer: { email: 'a@b.com', phone: '+79991234567' },
    })
    expect(payload.amount.currency).toBe('USD')
    expect(payload.receipt.customer.phone).toBe('+79991234567')
    expect(payload.metadata.customer_phone).toBe('+79991234567')
  })
})
