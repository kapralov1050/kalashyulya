import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
    }, { isTestMode: false })
    expect(payload.amount).toEqual({ value: '1500.50', currency: 'RUB' })
    expect(payload.capture).toBe(true)
    expect(payload.confirmation).toEqual({
      type: 'redirect',
      return_url: 'https://example.com/return',
    })
    expect(payload.description).toHaveLength(128)
    // Back-compat: metadata использует camelCase (Yandex-формат) + доп. поля
    expect(payload.metadata).toEqual({
      orderId: 'order_1',
      customerEmail: 'a@b.com',
      env: 'prod',
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
    }, { isTestMode: false })
    expect(payload.amount.currency).toBe('USD')
    expect(payload.receipt.customer.phone).toBe('+79991234567')
    expect(payload.metadata.customer_phone).toBe('+79991234567')
  })

  it('isTestMode=true записывает env=test в metadata', () => {
    const payload = buildYookassaPaymentPayload({
      orderId: 'order_t',
      amount: 100,
      description: 'X',
      returnUrl: 'https://example.com/r',
      customer: { email: 'a@b.com' },
    }, { isTestMode: true })
    expect(payload.metadata.env).toBe('test')
  })
})

describe('POST /api/payments/yookassa — test/prod credentials switching', () => {
  // Утилита: подставляем в handler нужные креды через process.env
  // и смотрим, какой Authorization уходит в $fetch (через мок).

  async function callHandler(body: Record<string, unknown>) {
    const handler = (await import('../yookassa.post')).default
    // readBody в handler читает event.body — мок vitest.setup.ts передаст его в valibot
    const event = {
      context: {},
      body,
    } as unknown
    return handler(event as never) as Promise<{ success: boolean, paymentId: string, confirmationUrl: string }>
  }

  function mockFetchToYookassa(): { captured: { auth?: string, url?: string } } {
    const captured: { auth?: string, url?: string } = {}
    vi.stubGlobal('$fetch', async (url: string, opts: { headers?: Record<string, string> }) => {
      captured.url = url
      captured.auth = opts.headers?.Authorization
      return {
        id: 'p_test',
        status: 'pending',
        confirmation: { type: 'redirect', confirmation_url: 'https://yoo.to/x' },
      }
    })
    return { captured }
  }

  beforeEach(() => {
    process.env.YOOKASSA_SHOP_ID = 'prod-shop-id'
    process.env.YOOKASSA_SECRET_KEY = 'prod-secret'
    delete process.env.YOOKASSA_TEST_MODE
    delete process.env.YOOKASSA_SHOP_ID_TEST
    delete process.env.YOOKASSA_SECRET_KEY_TEST
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('по умолчанию использует prod-креды (YOOKASSA_TEST_MODE не задан)', async () => {
    const { captured } = mockFetchToYookassa()
    await callHandler({
      orderId: 'order_1',
      amount: 100,
      description: 'X',
      returnUrl: 'https://example.com/r',
      customer: { email: 'a@b.com' },
    })
    expect(captured.url).toBe('https://api.yookassa.ru/v3/payments')
    const expected = 'Basic ' + Buffer.from('prod-shop-id:prod-secret').toString('base64')
    expect(captured.auth).toBe(expected)
  })

  it('YOOKASSA_TEST_MODE=true → использует *_TEST креды', async () => {
    process.env.YOOKASSA_TEST_MODE = 'true'
    process.env.YOOKASSA_SHOP_ID_TEST = 'test-shop-id'
    process.env.YOOKASSA_SECRET_KEY_TEST = 'test-secret-key'

    const { captured } = mockFetchToYookassa()
    await callHandler({
      orderId: 'order_2',
      amount: 200,
      description: 'Y',
      returnUrl: 'https://example.com/r',
      customer: { email: 'a@b.com' },
    })
    const expected = 'Basic ' + Buffer.from('test-shop-id:test-secret-key').toString('base64')
    expect(captured.auth).toBe(expected)
  })

  it('кидает 500 если креды отсутствуют для выбранного mode', async () => {
    delete process.env.YOOKASSA_TEST_MODE
    delete process.env.YOOKASSA_SHOP_ID
    process.env.YOOKASSA_SECRET_KEY = 'x'

    await expect(
      callHandler({
        orderId: 'o3',
        amount: 1,
        description: 'd',
        returnUrl: 'https://example.com/r',
        customer: { email: 'a@b.com' },
      }),
    ).rejects.toThrow(/Yookassa credentials not configured/)
  })
})
