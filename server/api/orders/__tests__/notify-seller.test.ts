import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { applyMigrations, insertFullOrder, setupTestDb } from '../../__tests__/helpers/db'

const TEST_DIR = resolve(process.cwd(), 'tmp-server-tests/orders-notify-seller')

// Мокаем ofetch ДО импорта notify-seller — handler делает $fetch на email/telegram endpoints.
vi.mock('ofetch', () => {
  const mock = Object.assign(vi.fn(), {
    raw: vi.fn(),
    create: vi.fn(),
  })
  ;(globalThis as Record<string, unknown>).$fetch = mock
  return { $fetch: mock }
})

// h3 named import — мокаем getRequestURL на уровне модуля, иначе named import
// остаётся реальным и падает на event.node.req.
vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('h3')>()
  return {
    ...actual,
    getRequestURL: () => ({ origin: 'http://localhost:3000' }),
  }
})

vi.stubGlobal('getRequestURL', () => ({ origin: 'http://localhost:3000' }))

beforeAll(() => {
  setupTestDb(TEST_DIR, 'test-orders-notify-seller.db')
})

afterAll(() => {
  rmSync(TEST_DIR, { recursive: true, force: true })
})

describe('POST /api/orders/[id]/notify-seller', () => {
  let getDb: typeof import('../../../utils/db').getDb
  let closeDb: typeof import('../../../utils/db').closeDb
  let handler: typeof import('../../../api/orders/[id]/notify-seller.post').default

  beforeAll(async () => {
    const dbModule = await import('../../../utils/db')
    getDb = dbModule.getDb
    closeDb = dbModule.closeDb

    applyMigrations(getDb())

    insertFullOrder(getDb(), {
      id: 'ns_yookassa',
      customer_name: 'Александр',
      customer_email: 'buyer@example.com',
      delivery_type: 'pickup',
      items_json: JSON.stringify([{ productId: '1', title: 'Мост', amount: 1, price: 8500 }]),
      total: 8500,
      status: 'new',
      payment_method: 'yookassa',
      created_at: Date.now(),
      updated_at: Date.now(),
    })

    insertFullOrder(getDb(), {
      id: 'ns_manual',
      customer_name: 'Мария',
      customer_email: 'maria@example.com',
      delivery_type: 'pickup',
      items_json: JSON.stringify([{ productId: '2', title: 'Картина', amount: 1, price: 10000 }]),
      total: 10000,
      status: 'new',
      payment_method: 'manual',
      created_at: Date.now(),
      updated_at: Date.now(),
    })

    handler = (await import('../../../api/orders/[id]/notify-seller.post')).default
  })

  beforeEach(() => {
    // Сбрасываем notification_failed между тестами, чтобы поведение «skip»
    // из предыдущего теста не ломало последующие (например, «один упал»).
    getDb()
      .prepare('UPDATE orders SET notification_failed = NULL WHERE id IN (?, ?, ?)')
      .run('ns_yookassa', 'ns_manual', 'ns_switched')
  })

  afterAll(() => {
    closeDb()
  })

  it('отправляет email+Telegram для заказа с payment_method=yookassa', async () => {
    const { $fetch } = await import('ofetch')
    const fetchMock = $fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockReset()
    // email endpoint → ok:true, telegram endpoint → success:true
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/api/notifications/email')) return { ok: true }
      if (url.includes('/api/notifications/telegram')) return { success: true }
      throw new Error(`Unexpected URL: ${url}`)
    })

    const event = {
      context: {},
      params: { id: 'ns_yookassa' },
      body: {},
    } as never

    const result = await handler(event)
    expect(result.ok).toBe(true)
    expect(result.paymentMethod).toBe('yookassa')
    expect(result.email.ok).toBe(true)
    expect(result.telegram.ok).toBe(true)

    // Оба endpoint'а должны быть вызваны
    const urls = fetchMock.mock.calls.map(c => c[0] as string)
    expect(urls.some(u => u.includes('/api/notifications/email'))).toBe(true)
    expect(urls.some(u => u.includes('/api/notifications/telegram'))).toBe(true)
  })

  it('отправляет email+Telegram для заказа с payment_method=manual', async () => {
    const { $fetch } = await import('ofetch')
    const fetchMock = $fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockReset()
    fetchMock.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({ success: true })

    const event = {
      context: {},
      params: { id: 'ns_manual' },
      body: {},
    } as never

    const result = await handler(event)
    expect(result.ok).toBe(true)
    expect(result.paymentMethod).toBe('manual')
    expect(result.email.ok).toBe(true)
    expect(result.telegram.ok).toBe(true)
  })

  it('читает АКТУАЛЬНЫЙ payment_method из БД (а не передаваемый в body)', async () => {
    // Создаём заказ с payment_method=yookassa, потом в БД меняем на manual.
    insertFullOrder(getDb(), {
      id: 'ns_switched',
      customer_name: 'Пётр',
      customer_email: 'p@example.com',
      delivery_type: 'pickup',
      items_json: JSON.stringify([{ productId: '3', title: 'X', amount: 1, price: 1000 }]),
      total: 1000,
      status: 'new',
      payment_method: 'yookassa',
      created_at: Date.now(),
      updated_at: Date.now(),
    })
    // Имитируем switchToManual — payment_method уже 'manual' в БД
    getDb().prepare('UPDATE orders SET payment_method = ? WHERE id = ?').run('manual', 'ns_switched')

    const { $fetch } = await import('ofetch')
    const fetchMock = $fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockReset()
    fetchMock.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({ success: true })

    const event = {
      context: {},
      params: { id: 'ns_switched' },
      body: {},
    } as never

    const result = await handler(event)
    expect(result.paymentMethod).toBe('manual')
  })

  it('ok=true даже если один из каналов упал (хотя бы один дошёл)', async () => {
    const { $fetch } = await import('ofetch')
    const fetchMock = $fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockReset()
    // email упал, telegram ок
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/api/notifications/email')) {
        return { ok: false, error: 'SMTP down' }
      }
      if (url.includes('/api/notifications/telegram')) return { success: true }
      throw new Error(`Unexpected URL: ${url}`)
    })

    const event = {
      context: {},
      params: { id: 'ns_yookassa' },
      body: {},
    } as never

    const result = await handler(event)
    expect(result.ok).toBe(true)
    expect(result.email.ok).toBe(false)
    expect(result.email.error).toBe('SMTP down')
    expect(result.telegram.ok).toBe(true)
  })

  it('ok=false если ОБА канала упали', async () => {
    const { $fetch } = await import('ofetch')
    const fetchMock = $fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockReset()
    fetchMock.mockImplementation(async () => {
      throw new Error('network down')
    })

    const event = {
      context: {},
      params: { id: 'ns_yookassa' },
      body: {},
    } as never

    const result = await handler(event)
    expect(result.ok).toBe(false)
    expect(result.email.ok).toBe(false)
    expect(result.telegram.ok).toBe(false)
  })

  it('404 для несуществующего заказа', async () => {
    const event = {
      context: {},
      params: { id: 'missing_order' },
      body: {},
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('400 без id в params', async () => {
    const event = {
      context: {},
      params: {},
      body: {},
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it('ИДЕМПОТЕНТНОСТЬ: если оба канала уже отправлены (notification_failed={telegram:true,email:true}) → skip', async () => {
    getDb()
      .prepare('UPDATE orders SET notification_failed = ? WHERE id = ?')
      .run(JSON.stringify({ telegram: true, email: true }), 'ns_yookassa')

    const { $fetch } = await import('ofetch')
    const fetchMock = $fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockClear()

    const event = {
      context: {},
      params: { id: 'ns_yookassa' },
      body: {},
    } as never

    const result = await handler(event)
    expect(result.skipped).toBe(true)
    expect(result.ok).toBe(true)
    expect(result.email.skipped).toBe(true)
    expect(result.telegram.skipped).toBe(true)

    // Никаких fetch-вызовов — оба канала уже отправлены ранее
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('ИДЕМПОТЕНТНОСТЬ: если telegram уже отправлен → шлёт только email', async () => {
    getDb()
      .prepare('UPDATE orders SET notification_failed = ? WHERE id = ?')
      .run(JSON.stringify({ telegram: true, email: false }), 'ns_yookassa')

    const { $fetch } = await import('ofetch')
    const fetchMock = $fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockClear()
    fetchMock.mockResolvedValueOnce({ ok: true }) // только email

    const event = {
      context: {},
      params: { id: 'ns_yookassa' },
      body: {},
    } as never

    const result = await handler(event)
    expect(result.email.skipped).toBeUndefined()
    expect(result.telegram.skipped).toBe(true)

    const urls = fetchMock.mock.calls.map(c => c[0] as string)
    expect(urls.some(u => u.includes('/api/notifications/email'))).toBe(true)
    expect(urls.some(u => u.includes('/api/notifications/telegram'))).toBe(false)

    // БД обновилась: telegram по-прежнему true, email теперь true
    const stored = getDb()
      .prepare('SELECT notification_failed FROM orders WHERE id = ?')
      .get('ns_yookassa') as { notification_failed: string }
    const notif = JSON.parse(stored.notification_failed)
    expect(notif).toEqual({ telegram: true, email: true })
  })

  it('записывает результат в БД (для админки)', async () => {
    const { $fetch } = await import('ofetch')
    const fetchMock = $fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockReset()
    fetchMock.mockResolvedValueOnce({ ok: false, error: 'SMTP down' })
      .mockResolvedValueOnce({ success: true })

    const event = {
      context: {},
      params: { id: 'ns_manual' },
      body: {},
    } as never

    await handler(event)

    // БД должна содержать результат — админ видит что email упал
    const stored = getDb()
      .prepare('SELECT notification_failed FROM orders WHERE id = ?')
      .get('ns_manual') as { notification_failed: string }
    const notif = JSON.parse(stored.notification_failed)
    expect(notif.telegram).toBe(true)
    expect(notif.email).toBe(false)
  })
})