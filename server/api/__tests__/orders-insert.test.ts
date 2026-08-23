/**
 * Регрессионный тест: schema Phase D (orders) имеет 19 колонок,
 * и INSERT должен передавать ровно 19 параметров. Раньше здесь было 18,
 * что приводило к "RangeError: Too few parameter values were provided"
 * на проде с 500 Server Error при попытке оформить заказ.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const TEST_DIR = resolve(process.cwd(), 'tmp-server-tests')
const TEST_DB = resolve(TEST_DIR, 'test-orders-insert.db')

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

    // Подменяем $fetch и createError, чтобы triggerOrderNotifications не падал
    globalThis.$fetch = vi.fn(async () => ({ success: true })) as never
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
    expect(order.status).toBe('new')  // критично: раньше был null
    expect(order.customer_name).toBe('Test User')
    expect(order.customer_messenger).toBe('Telegram')
    expect(order.total).toBe(1000)
    // paymentMethod сохраняется из body (Phase D-фикс: больше не хардкодится 'manual')
    expect(order.payment_method).toBe('manual')  // body без paymentMethod → default 'manual'
    // items_json хранит `amount` (Firebase-контракт), а не `qty`
    const items = JSON.parse(order.items_json as string)
    expect(items[0]).toMatchObject({ productId: '1', title: 'Test', price: 1000, amount: 1 })
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
})