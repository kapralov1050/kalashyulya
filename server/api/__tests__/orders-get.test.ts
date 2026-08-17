/**
 * Тесты DTO-маппинга в server/api/orders.get.ts.
 *
 * Цель — зафиксировать контракт между SQLite-строкой и OrderInBase-shaped JSON,
 * который ждут фронтовые компоненты (admin/OrdersList, /shop/tracking,
 * /shop/payment-success).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

// Перенаправляем DB в отдельный файл чтобы не зависеть от дефолтного пути
const TEST_DIR = resolve(process.cwd(), 'tmp-server-tests')
const TEST_DB = resolve(TEST_DIR, 'test-orders.db')

beforeAll(() => {
  mkdirSync(TEST_DIR, { recursive: true })
  process.env.SQLITE_PATH = TEST_DB
  process.env.NODE_ENV = 'test'

  // Импортируем getDb после установки env, чтобы singleton открыл наш файл
  // (динамический импорт через require() после установки process.env)
})

afterAll(() => {
  rmSync(TEST_DIR, { recursive: true, force: true })
})

describe('orders.get DTO mapping', () => {
  let getDb: typeof import('../../utils/db').getDb
  let closeDb: typeof import('../../utils/db').closeDb
  let ordersGetHandler: typeof import('../orders.get').default

  beforeAll(async () => {
    const dbModule = await import('../../utils/db')
    getDb = dbModule.getDb
    closeDb = dbModule.closeDb

    // Применяем схему (идемпотентно через CREATE TABLE IF NOT EXISTS)
    const schemaPath = resolve(process.cwd(), 'server/schema/001_init.sql')
    const schema = (await import('node:fs')).readFileSync(schemaPath, 'utf-8')
    getDb().exec(schema)

    // Сидим один заказ
    const now = Date.now()
    getDb().prepare(`
      INSERT INTO orders (id, customer_name, customer_email, customer_phone,
                          city, address, items_json, total, status, comment,
                          created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?)
    `).run(
      'order_2',
      'Анна',
      'ann@example.com',
      '+79991234567',
      'Москва',
      'ул. Тверская, 1',
      JSON.stringify([{ productId: 'product_107', title: 'Тихий свет зимы', price: 6000, qty: 1 }]),
      6000,
      null,
      now,
      now,
    )

    // Импортируем handler ПОСЛЕ сидинга
    ordersGetHandler = (await import('../orders.get')).default
  })

  afterAll(() => {
    closeDb()
  })

  it('возвращает заказ в формате OrderInBase (Firebase-era shape)', async () => {
    const fakeEvent = { context: {} } as unknown as Parameters<typeof ordersGetHandler>[0]
    const result = await ordersGetHandler(fakeEvent)

    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(1)

    const order = result[0]!
    expect(order.id).toBe('order_2')
    // Nested customer
    expect(order.customer).toMatchObject({
      name: 'Анна',
      email: 'ann@example.com',
      phone: '+79991234567',
    })
    expect(order.customer.delivery).toMatchObject({
      city: 'Москва',
      address: 'ул. Тверская, 1',
    })
    // Purchase nested
    expect(order.purchase.order).toEqual([
      { productId: 'product_107', title: 'Тихий свет зимы', price: 6000, qty: 1 },
    ])
    expect(typeof order.purchase.createdAt).toBe('string')
    // Flat values mapped to Firebase-era names
    expect(order.totalPrice).toBe(6000)
    expect(order.status).toBe('new')
    // Defaults for fields not stored in DB
    expect(order.paymentMethod).toBe('manual')
    expect(order.paymentId).toBe('')
    expect(order.notificationFailed).toEqual({ telegram: false, email: false })
    expect(order.framing).toBe('')
  })

  it('фильтрует по статусу', async () => {
    const fakeEvent = { context: {}, query: { status: 'paid' } } as unknown as Parameters<typeof ordersGetHandler>[0]
    const paid = await ordersGetHandler(fakeEvent)
    expect(paid).toHaveLength(0)

    const newEvent = { context: {}, query: { status: 'new' } } as unknown as Parameters<typeof ordersGetHandler>[0]
    const newOrders = await ordersGetHandler(newEvent)
    expect(newOrders).toHaveLength(1)
  })

  it('не падает на пустой БД', async () => {
    // Очистим таблицу временно
    getDb().prepare('DELETE FROM orders').run()

    const fakeEvent = { context: {} } as unknown as Parameters<typeof ordersGetHandler>[0]
    const empty = await ordersGetHandler(fakeEvent)
    expect(empty).toEqual([])

    // Восстановим для других тестов
    getDb().prepare('INSERT INTO orders (id, customer_name, customer_email, items_json, total, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      'order_2',
      'Анна',
      'ann@example.com',
      JSON.stringify([{ productId: 'product_107', title: 'Тихий свет зимы', price: 6000, qty: 1 }]),
      6000,
      Date.now(),
      Date.now(),
    )
  })
})