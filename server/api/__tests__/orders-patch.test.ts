import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { applyMigrations, insertFullOrder, setupTestDb } from './helpers/db'

const TEST_DIR = resolve(process.cwd(), 'tmp-server-tests/orders-patch')

beforeAll(() => {
  setupTestDb(TEST_DIR, 'test-orders-patch.db')
})

afterAll(() => {
  rmSync(TEST_DIR, { recursive: true, force: true })
})

describe('PATCH /api/orders/[id]', () => {
  let getDb: typeof import('../../utils/db').getDb
  let closeDb: typeof import('../../utils/db').closeDb
  let handler: typeof import('../orders/[id].patch').default

  beforeAll(async () => {
    const dbModule = await import('../../utils/db')
    getDb = dbModule.getDb
    closeDb = dbModule.closeDb

    applyMigrations(getDb())

    insertFullOrder(getDb(), {
      id: 'order_patch_1',
      customer_name: 'Петя',
      customer_email: 'petya@example.com',
      delivery_type: 'pickup',
      items_json: JSON.stringify([{ productId: '1', title: 'X', price: 100, amount: 1 }]),
      total: 100,
      status: 'new',
      payment_method: 'manual',
      created_at: Date.now(),
      updated_at: Date.now(),
    })

    handler = (await import('../orders/[id].patch')).default
  })

  afterAll(() => {
    closeDb()
  })

  it('PATCH обновляет payment_id для существующего заказа', async () => {
    const event = {
      context: {},
      params: { id: 'order_patch_1' },
      body: { paymentId: 'pay_12345' },
    } as never

    const result = await handler(event)
    expect(result).toEqual({ ok: true })

    const order = getDb()
      .prepare('SELECT * FROM orders WHERE id = ?')
      .get('order_patch_1') as Record<string, unknown>
    expect(order.payment_id).toBe('pay_12345')
  })

  it('PATCH с несуществующим id возвращает 404', async () => {
    const event = {
      context: {},
      params: { id: 'missing_order' },
      body: { paymentId: 'pay_999' },
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Заказ не найден',
    })
  })

  it('PATCH без paymentId возвращает 400', async () => {
    const event = {
      context: {},
      params: { id: 'order_patch_1' },
      body: {},
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'paymentId обязателен',
    })
  })

  it('PATCH с пустым paymentId возвращает 400', async () => {
    const event = {
      context: {},
      params: { id: 'order_patch_1' },
      body: { paymentId: '   ' },
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'paymentId обязателен',
    })
  })

  it('PATCH без id возвращает 400', async () => {
    const event = {
      context: {},
      params: {},
      body: { paymentId: 'pay_123' },
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'id обязателен',
    })
  })
})
