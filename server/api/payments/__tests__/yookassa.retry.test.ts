import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('POST /api/payments/yookassa — retry cancel-flow', () => {
  async function callHandler(body: Record<string, unknown>, headers: Record<string, string> = {}) {
    const handler = (await import('../yookassa.post')).default
    const event = {
      context: {},
      headers,
      body,
    } as unknown
    return handler(event as never) as Promise<{
      success: boolean
      paymentId: string
      confirmationUrl: string
      status: string
    }>
  }

  function mockYookassa(handlers: {
    getStatus?: string
    cancelOk?: boolean
    createId?: string
  }): { captured: { getUrl?: string, cancelUrl?: string, createUrl?: string, cancelAuth?: string } } {
    const captured: { getUrl?: string, cancelUrl?: string, createUrl?: string, cancelAuth?: string } = {}
    vi.stubGlobal('$fetch', async (url: string, opts: { method?: string, headers?: Record<string, string> }) => {
      if (url.endsWith('/cancel')) {
        captured.cancelUrl = url
        captured.cancelAuth = opts.headers?.Authorization
        if (handlers.cancelOk === false) {
          const err = new Error('cancel failed') as Error & { status: number }
          err.status = 500
          throw err
        }
        return { status: 'canceled' }
      }
      if (url.startsWith('https://api.yookassa.ru/v3/payments/') && opts.method === 'GET') {
        captured.getUrl = url
        if (handlers.getStatus === '404') {
          const err = new Error('not found') as Error & { status: number }
          err.status = 404
          throw err
        }
        return { status: handlers.getStatus ?? 'pending' }
      }
      if (url === 'https://api.yookassa.ru/v3/payments') {
        captured.createUrl = url
        return {
          id: handlers.createId ?? 'p_new',
          status: 'pending',
          confirmation: { type: 'redirect', confirmation_url: 'https://yoo.to/new' },
        }
      }
      throw new Error(`Unexpected URL: ${url}`)
    })
    return { captured }
  }

  beforeEach(() => {
    process.env.YOOKASSA_SHOP_ID = 'prod-shop-id'
    process.env.YOOKASSA_SECRET_KEY = 'prod-secret'
    delete process.env.YOOKASSA_TEST_MODE
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('без retryPaymentId — НЕ делает GET /cancel, сразу создаёт платёж', async () => {
    const { captured } = mockYookassa({})
    await callHandler({
      orderId: 'o_1',
      amount: 100,
      description: 'X',
      returnUrl: 'https://example.com/r',
      customer: { email: 'a@b.com' },
    })
    expect(captured.getUrl).toBeUndefined()
    expect(captured.cancelUrl).toBeUndefined()
    expect(captured.createUrl).toBe('https://api.yookassa.ru/v3/payments')
  })

  it('retryPaymentId + pending → GET → POST cancel → create', async () => {
    const { captured } = mockYookassa({ getStatus: 'pending' })
    const result = await callHandler({
      orderId: 'o_2',
      amount: 200,
      description: 'Y',
      returnUrl: 'https://example.com/r',
      customer: { email: 'a@b.com' },
      retryPaymentId: 'p_old',
    })
    expect(captured.getUrl).toBe('https://api.yookassa.ru/v3/payments/p_old')
    expect(captured.cancelUrl).toBe('https://api.yookassa.ru/v3/payments/p_old/cancel')
    const expectedAuth = 'Basic ' + Buffer.from('prod-shop-id:prod-secret').toString('base64')
    expect(captured.cancelAuth).toBe(expectedAuth)
    expect(result.paymentId).toBe('p_new')
  })

  it('retryPaymentId + canceled (уже отменён) → НЕ вызывает cancel, сразу create', async () => {
    const { captured } = mockYookassa({ getStatus: 'canceled' })
    await callHandler({
      orderId: 'o_3',
      amount: 100,
      description: 'Z',
      returnUrl: 'https://example.com/r',
      customer: { email: 'a@b.com' },
      retryPaymentId: 'p_old_canceled',
    })
    expect(captured.getUrl).toBe('https://api.yookassa.ru/v3/payments/p_old_canceled')
    expect(captured.cancelUrl).toBeUndefined()
    expect(captured.createUrl).toBe('https://api.yookassa.ru/v3/payments')
  })

  it('retryPaymentId + succeeded → кидает 409 (защита от двойной оплаты)', async () => {
    mockYookassa({ getStatus: 'succeeded' })
    const result = callHandler({
      orderId: 'o_4',
      amount: 100,
      description: 'W',
      returnUrl: 'https://example.com/r',
      customer: { email: 'a@b.com' },
      retryPaymentId: 'p_succeeded',
    })
    await expect(result).rejects.toThrow(/Previous payment already succeeded/)
  })

  it('retryPaymentId + 404 (платёж не найден) → НЕ блокирует создание нового', async () => {
    const { captured } = mockYookassa({ getStatus: '404' })
    await callHandler({
      orderId: 'o_5',
      amount: 100,
      description: 'V',
      returnUrl: 'https://example.com/r',
      customer: { email: 'a@b.com' },
      retryPaymentId: 'p_missing',
    })
    expect(captured.cancelUrl).toBeUndefined()
    expect(captured.createUrl).toBe('https://api.yookassa.ru/v3/payments')
  })

  it('cancel упал → НЕ блокирует создание нового (best-effort)', async () => {
    const { captured } = mockYookassa({ getStatus: 'pending', cancelOk: false })
    await callHandler({
      orderId: 'o_6',
      amount: 100,
      description: 'U',
      returnUrl: 'https://example.com/r',
      customer: { email: 'a@b.com' },
      retryPaymentId: 'p_to_cancel',
    })
    expect(captured.cancelUrl).toBe('https://api.yookassa.ru/v3/payments/p_to_cancel/cancel')
    expect(captured.createUrl).toBe('https://api.yookassa.ru/v3/payments')
  })
})