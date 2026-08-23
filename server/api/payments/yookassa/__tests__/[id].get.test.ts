import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('GET /api/payments/yookassa/:id — status check', () => {
  async function callHandler(id: string, query: Record<string, string> = {}, headers: Record<string, string> = {}) {
    const handler = (await import('../[id].get')).default
    // nitro getRouterParam читает event.params и event.context.params (см. vitest.setup.ts)
    const event = {
      headers,
      query,
      params: { id },
      context: { params: { id } },
    } as unknown
    return handler(event as never) as Promise<{
      success: boolean
      status?: string
      paid?: boolean
      amount?: string
      paymentId?: string
    }>
  }

  function mockFetchToYookassa(response: unknown, statusCode = 200): { captured: { auth?: string, url?: string } } {
    const captured: { auth?: string, url?: string } = {}
    vi.stubGlobal('$fetch', async (url: string, opts: { headers?: Record<string, string> }) => {
      captured.url = url
      captured.auth = opts.headers?.Authorization
      if (statusCode !== 200) {
        const err = new Error('fetch failed') as Error & { status: number }
        err.status = statusCode
        throw err
      }
      return response
    })
    return { captured }
  }

  beforeEach(() => {
    process.env.YOOKASSA_SHOP_ID = 'prod-shop-id'
    process.env.YOOKASSA_SECRET_KEY = 'prod-secret'
    process.env.YOOKASSA_SHOP_ID_TEST = 'test-shop-id'
    process.env.YOOKASSA_SECRET_KEY_TEST = 'test-secret'
    delete process.env.YOOKASSA_TEST_MODE
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GET платежа со статусом succeeded → возвращает paid=true', async () => {
    const { captured } = mockFetchToYookassa({
      id: 'p_1',
      status: 'succeeded',
      paid: true,
      amount: { value: '5000.00', currency: 'RUB' },
    })
    const result = await callHandler('p_1')
    expect(captured.url).toBe('https://api.yookassa.ru/v3/payments/p_1')
    const expectedAuth = 'Basic ' + Buffer.from('prod-shop-id:prod-secret').toString('base64')
    expect(captured.auth).toBe(expectedAuth)
    expect(result).toEqual({
      success: true,
      paymentId: 'p_1',
      status: 'succeeded',
      paid: true,
      amount: '5000.00',
      currency: 'RUB',
    })
  })

  it('GET платежа со статусом canceled → возвращает paid=false', async () => {
    mockFetchToYookassa({
      id: 'p_2',
      status: 'canceled',
      paid: false,
      amount: { value: '1500.00', currency: 'RUB' },
    })
    const result = await callHandler('p_2')
    expect(result.success).toBe(true)
    expect(result.status).toBe('canceled')
    expect(result.paid).toBe(false)
  })

  it('GET платежа со статусом pending → возвращает paid=false', async () => {
    mockFetchToYookassa({
      id: 'p_3',
      status: 'pending',
      paid: false,
      amount: { value: '700.00', currency: 'RUB' },
    })
    const result = await callHandler('p_3')
    expect(result.status).toBe('pending')
    expect(result.paid).toBe(false)
  })

  it('404 от YooKassa → возвращает success:true status:not_found (не 500)', async () => {
    mockFetchToYookassa({}, 404)
    const result = await callHandler('missing-id')
    expect(result).toEqual({ success: true, status: 'not_found', paymentId: 'missing-id' })
  })

  it('пустой id → 400', async () => {
    const result = callHandler('')
    await expect(result).rejects.toThrow(/paymentId is required/)
  })

  it('test=1 в query → использует *_TEST credentials', async () => {
    const { captured } = mockFetchToYookassa({
      id: 'p_t',
      status: 'pending',
      paid: false,
      amount: { value: '100.00', currency: 'RUB' },
    })
    await callHandler('p_t', { test: '1' })
    const expectedAuth = 'Basic ' + Buffer.from('test-shop-id:test-secret').toString('base64')
    expect(captured.auth).toBe(expectedAuth)
  })

  it('Origin от test-host → автоматически test credentials (без query)', async () => {
    const { captured } = mockFetchToYookassa({
      id: 'p_o',
      status: 'pending',
      paid: false,
      amount: { value: '100.00', currency: 'RUB' },
    })
    await callHandler('p_o', {}, { origin: 'http://localhost:3000' })
    const expectedAuth = 'Basic ' + Buffer.from('test-shop-id:test-secret').toString('base64')
    expect(captured.auth).toBe(expectedAuth)
  })

  it('креды не настроены → 500', async () => {
    delete process.env.YOOKASSA_SHOP_ID
    delete process.env.YOOKASSA_SECRET_KEY
    const result = callHandler('p_x', {}, { origin: 'https://example.com' })
    await expect(result).rejects.toThrow(/Payment service not configured/)
  })

  it('500 от YooKassa → пробрасывает 502 Bad Gateway', async () => {
    mockFetchToYookassa({}, 500)
    const result = callHandler('p_y', {}, { origin: 'https://example.com' })
    await expect(result).rejects.toThrow(/Failed to check payment status/)
  })
})