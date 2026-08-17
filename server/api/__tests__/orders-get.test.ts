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
    getDb().prepare(`
      INSERT INTO orders (id, customer_name, customer_email, customer_phone,
                          customer_messenger, customer_nickname,
                          city, address,
                          delivery_type, delivery_recipient, delivery_street, delivery_house, delivery_apartment,
                          items_json, total, status, comment, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'order_2',
      'Анна',
      'ann@example.com',
      '+79991234567',
      'Telegram',
      '@anna',
      'Москва',
      'ул. Тверская, 1',
      'delivery',
      'Анна Аннова',
      'ул. Тверская',
      '1',
      '12',
      JSON.stringify([{ productId: 'product_107', title: 'Тихий свет зимы', price: 6000, qty: 1 }]),
      6000,
      'new',
      null,
      Date.now(),
      Date.now(),
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
    // id в БД — TEXT ('order_2'). OrderInBase.id разрешает number|string.
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
    // Phase D: framing нет в SQLite (FB тоже не хранит), просто отсутствует.
    expect(order.framing).toBeUndefined()
  })

  it('достаёт ВСЕ поля из Firebase customer.delivery (Phase D)', async () => {
    const fakeEvent = { context: {} } as unknown as Parameters<typeof ordersGetHandler>[0]
    const result = await ordersGetHandler(fakeEvent)
    const order = result[0]!

    // Phase D: добавлены поля, которых раньше терялись
    expect(order.customer.userMessenger).toBe('Telegram')
    expect(order.customer.userNickname).toBe('@anna')
    expect(order.customer.delivery.type).toBe('delivery')
    expect(order.customer.delivery.recipient).toBe('Анна Аннова')
    expect(order.customer.delivery.street).toBe('ул. Тверская')
    expect(order.customer.delivery.house).toBe('1')
    expect(order.customer.delivery.apartment).toBe('12')
    // city/address всё ещё работают
    expect(order.customer.delivery.city).toBe('Москва')
    expect(order.customer.delivery.address).toBe('ул. Тверская, 1')
  })

  it('фильтрует по статусу', async () => {
    const fakeEvent = { context: {}, query: { status: 'paid' } } as unknown as Parameters<typeof ordersGetHandler>[0]
    const paid = await ordersGetHandler(fakeEvent)
    expect(paid).toHaveLength(0)

    const newEvent = { context: {}, query: { status: 'new' } } as unknown as Parameters<typeof ordersGetHandler>[0]
    const newOrders = await ordersGetHandler(newEvent)
    expect(newOrders).toHaveLength(1)
  })

  // Не падает на пустой БД — протестировано отдельно (требует чистой БД,
// трудно изолировать через SAVEPOINT в WAL-mode с singleton).
// Корректность маппинга покрыта первыми двумя тестами.
})