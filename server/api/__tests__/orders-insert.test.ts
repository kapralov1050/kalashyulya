/**
 * Регрессионный тест: schema orders имеет 23 колонки (12 из 001_init.sql +
 * 7 из 003_orders.sql + 1 payment_method из 004 + 3 из 005_orders.sql),
 * и INSERT должен передавать ровно 23 параметра. Раньше здесь было 18,
 * что приводило к "RangeError: Too few parameter values were provided"
 * на проде с 500 Server Error при попытке оформить заказ.
 *
 * Также проверяет Phase D-фиксы:
 * - paymentMethod ('yookassa' | 'manual') сохраняется из body
 * - framing сохраняется в БД (не теряется)
 * - items_json хранит 'amount' (Firebase-контракт), а не 'qty'
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const TEST_DIR = resolve(process.cwd(), 'tmp-server-tests/orders-insert')
const TEST_DB = resolve(TEST_DIR, 'test-orders-insert.db')

// Подменяем $fetch ДО импорта orders.post (vi.mock поднимается наверх).
// ofech экспортирует $fetch как named export; в Nuxt-серверном коде $fetch —
// globalThis.$fetch (auto-import). В тестах Nitro-runtime не загружается, поэтому
// мок модуля подменяет globalThis.$fetch на наш мок.
//
// ВАЖНО: устанавливаем $fetch и в globalThis, потому что production-код
// использует его как global (через $fetch.raw), не импортирует.
vi.mock('ofetch', () => {
  const mock = Object.assign(vi.fn(), {
    raw: vi.fn(async () => ({
      _data: { success: true, ok: true },
      status: 200,
      headers: new Headers(),
      ok: true,
    })),
    create: vi.fn(),
  })
  // Делаем mock доступным и как globalThis.$fetch
  ;(globalThis as Record<string, unknown>).$fetch = mock
  return { $fetch: mock }
})

// getRequestURL — Nitro global (h3), в тестах отсутствует. Мокаем как global.
vi.stubGlobal('getRequestURL', () => ({ origin: 'http://localhost:3000' }))

beforeAll(() => {
  mkdirSync(TEST_DIR, { recursive: true })
  process.env.SQLITE_PATH = TEST_DB
  process.env.NODE_ENV = 'test'
})

afterAll(() => {
  rmSync(TEST_DIR, { recursive: true, force: true })
})

describe('POST /api/orders (regression: parameter count)', () => {
  let getDb: typeof import('../../utils/db').getDb
  let closeDb: typeof import('../../utils/db').closeDb
  let handler: typeof import('../orders.post').default

  beforeAll(async () => {
    const dbModule = await import('../../utils/db')
    getDb = dbModule.getDb
    closeDb = dbModule.closeDb

    // Schema применяется через applyMigrations() в getDb().
    // Seed минимальный admin (если потребуется), но для INSERT в orders не нужно.

    // $fetch уже замокан на module level (vi.mock 'ofetch') — handler будет
    // получать успешный ответ от обеих нотификаций. Тест проверяет, что
    // notification_failed в БД содержит JSON с {telegram: true, email: true}.
  })

  afterAll(() => {
    closeDb()
  })

  it('INSERT в orders принимает 19 параметров (без RangeError)', async () => {
    handler = (await import('../orders.post')).default

    const event = {
      context: {},
      body: {
        customer: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+79991234567',
          userMessenger: 'Telegram',
          userNickname: '@test',
          delivery: {
            type: 'pickup',
            city: 'Москва',
            address: 'ул. Тверская, 1',
            recipient: 'Test User',
            street: '',
            house: '',
            apartment: '',
          },
        },
        purchase: {
          order: [{ id: 1, title: 'Test', price: 1000, amount: 1 }],
          createdAt: new Date().toISOString(),
        },
        totalPrice: 1000,
      },
    } as never

    const result = await handler(event)
    expect(result).toMatchObject({ total: 1000 })
    expect(result.id).toMatch(/^\d{8}-[a-f0-9]+$/)

    // Проверяем что запись попала в БД с правильными полями
    const order = getDb()
      .prepare('SELECT * FROM orders WHERE id = ?')
      .get(result.id) as Record<string, unknown>
    expect(order).toBeDefined()
    expect(order.status).toBe('new') // критично: раньше был null
    expect(order.customer_name).toBe('Test User')
    expect(order.customer_messenger).toBe('Telegram')
    expect(order.total).toBe(1000)
    // paymentMethod сохраняется из body (Phase D-фикс: больше не хардкодится 'manual')
    expect(order.payment_method).toBe('manual') // body без paymentMethod → default 'manual'
    // items_json хранит `amount` (Firebase-контракт), а не `qty`
    const items = JSON.parse(order.items_json as string)
    expect(items[0]).toMatchObject({
      productId: '1',
      title: 'Test',
      price: 1000,
      amount: 1,
    })
    expect(items[0].qty).toBeUndefined()
  })

  it('INSERT не падает на отсутствующих optional полях (nullable)', async () => {
    const event = {
      context: {},
      body: {
        customer: {
          name: 'Min',
          email: 'min@example.com',
          // phone, messenger, nickname, delivery — все undefined
          delivery: { type: 'pickup' },
        },
        purchase: {
          order: [{ id: 2, title: 'X', price: 100, amount: 1 }],
          createdAt: new Date().toISOString(),
        },
        totalPrice: 100,
      },
    } as never

    const result = await handler(event)
    expect(result.id).toBeDefined()
    const order = getDb()
      .prepare('SELECT * FROM orders WHERE id = ?')
      .get(result.id) as Record<string, unknown>
    expect(order.status).toBe('new')
    expect(order.customer_phone).toBeNull()
    // eslint-disable-next-line no-console
    console.log('DEBUG order:', JSON.stringify(order, null, 2))
    expect(order.city).toBeNull()
    expect(order.address).toBeNull()
    // paymentMethod без явного значения в body → 'manual' (default)
    expect(order.payment_method).toBe('manual')
  })

  it('paymentMethod=yookassa сохраняется в БД', async () => {
    const event = {
      context: {},
      body: {
        customer: {
          name: 'Yoo User',
          email: 'yoo@example.com',
        },
        purchase: {
          order: [{ id: 3, title: 'Y', price: 500, amount: 1 }],
          createdAt: new Date().toISOString(),
        },
        totalPrice: 500,
        paymentMethod: 'yookassa',
      },
    } as never

    const result = await handler(event)
    const order = getDb()
      .prepare('SELECT * FROM orders WHERE id = ?')
      .get(result.id) as Record<string, unknown>
    expect(order.payment_method).toBe('yookassa')
  })

  it('framing сохраняется в БД (Phase D-фикс #3)', async () => {
    const event = {
      context: {},
      body: {
        customer: {
          name: 'Frame User',
          email: 'frame@example.com',
        },
        purchase: {
          order: [{ id: 4, title: 'F', price: 100, amount: 1 }],
          createdAt: new Date().toISOString(),
        },
        totalPrice: 100,
        framing: 'premium',
      },
    } as never

    const result = await handler(event)
    const order = getDb()
      .prepare('SELECT * FROM orders WHERE id = ?')
      .get(result.id) as Record<string, unknown>
    expect(order.framing).toBe('premium')
  })

  it('notification_failed сохраняется в БД как JSON (Phase D-фикс #2)', async () => {
    // Перед тестом — подменяем $fetch чтобы вернул {success: true} для обеих нотификаций
    // (используется $fetch.raw в handler). Это имитирует успешные Telegram+email.
    const event = {
      context: {},
      body: {
        customer: { name: 'Notif User', email: 'notif@example.com' },
        purchase: {
          order: [{ id: 5, title: 'N', price: 100, amount: 1 }],
          createdAt: new Date().toISOString(),
        },
        totalPrice: 100,
      },
    } as never

    const result = await handler(event)
    const order = getDb()
      .prepare('SELECT * FROM orders WHERE id = ?')
      .get(result.id) as Record<string, unknown>

    // eslint-disable-next-line no-console
    console.log('DEBUG notification_failed:', order.notification_failed)
    // JSON парсится корректно
    const notif = JSON.parse(order.notification_failed as string)
    expect(notif).toEqual({ telegram: true, email: true })
  })

  it('paymentMethod=yookassa НЕ отправляет НИ email НИ telegram в orders.post (skipped)', async () => {
    // Отслеживаем какие endpoint'ы были вызваны. orders.post.ts использует $fetch.raw,
    // поэтому смотрим именно его calls (не голый $fetch).
    const { $fetch } = await import('ofetch')
    const fetchRawMock = (
      $fetch as unknown as { raw: ReturnType<typeof vi.fn> }
    ).raw
    fetchRawMock.mockClear()

    const event = {
      context: {},
      body: {
        customer: { name: 'Yoo Skip', email: 'skip@example.com' },
        purchase: {
          order: [{ id: 6, title: 'S', price: 100, amount: 1 }],
          createdAt: new Date().toISOString(),
        },
        totalPrice: 100,
        paymentMethod: 'yookassa',
      },
    } as never

    const result = await handler(event)
    const order = getDb()
      .prepare('SELECT * FROM orders WHERE id = ?')
      .get(result.id) as Record<string, unknown>

    // notification_failed: для yookassa orders.post НЕ сохраняет ничего (null).
    // Раньше сохранял { telegram: true, email: true } — это было враньё
    // (ничего не отправлялось). Теперь честно: уведомления ещё не отправлялись.
    expect(order.notification_failed).toBeNull()

    // Ни для email, ни для telegram НЕ должно быть fetch-вызова в orders.post.
    // Уведомления уйдут позже из /api/orders/[id]/notify-seller.
    const calledUrls = fetchRawMock.mock.calls.map(c => c[0] as string)
    expect(calledUrls.some(u => u.includes('/api/notifications/email'))).toBe(
      false,
    )
    expect(
      calledUrls.some(u => u.includes('/api/notifications/telegram')),
    ).toBe(false)
  })
})
