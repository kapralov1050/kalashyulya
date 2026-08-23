import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { applyMigrations, insertFullOrder, setupTestDb } from './helpers/db'

const requireAuthMock = vi.fn()

vi.mock('../../utils/requireAuth', () => ({
  requireAuth: (event: unknown) => requireAuthMock(event),
}))

const TEST_DIR = resolve(process.cwd(), 'tmp-server-tests/orders-delete')

setupTestDb(TEST_DIR, 'test-orders-delete.db')

beforeAll(() => {
  requireAuthMock.mockReset()
  requireAuthMock.mockReturnValue({ id: 1, email: 'admin@test', name: 'Admin' })
})

afterAll(() => {
  rmSync(TEST_DIR, { recursive: true, force: true })
})

describe('DELETE /api/admin/orders/[id]', () => {
  let getDb: typeof import('../../utils/db').getDb
  let closeDb: typeof import('../../utils/db').closeDb
  let handler: typeof import('../admin/orders/[id].delete').default

  beforeAll(async () => {
    const dbModule = await import('../../utils/db')
    getDb = dbModule.getDb
    closeDb = dbModule.closeDb

    applyMigrations(getDb())
    insertFullOrder(getDb(), {
      id: 'order_del_1',
      customer_name: 'Вася',
      customer_email: 'vasya@example.com',
      delivery_type: 'pickup',
      items_json: JSON.stringify([{ productId: '1', title: 'X', price: 100, amount: 1 }]),
      total: 100,
      status: 'new',
      payment_method: 'manual',
      created_at: Date.now(),
      updated_at: Date.now(),
    })

    handler = (await import('../admin/orders/[id].delete')).default
  })

  afterAll(() => {
    closeDb()
  })

  it('удаляет существующий заказ и возвращает { ok: true }', async () => {
    const event = {
      context: {},
      params: { id: 'order_del_1' },
    } as never

    const result = await handler(event)
    expect(result).toEqual({ ok: true })

    const row = getDb()
      .prepare('SELECT * FROM orders WHERE id = ?')
      .get('order_del_1')
    expect(row).toBeUndefined()
  })

  it('вызывает requireAuth перед удалением', async () => {
    requireAuthMock.mockClear()
    const event = {
      context: {},
      params: { id: 'missing' },
    } as never
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 404 })
    expect(requireAuthMock).toHaveBeenCalledWith(event)
  })

  it('DELETE с несуществующим id возвращает 404', async () => {
    const event = {
      context: {},
      params: { id: 'missing_order' },
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Заказ не найден',
    })
  })

  it('DELETE повторно того же id возвращает 404 (защита от двойного клика)', async () => {
    insertFullOrder(getDb(), {
      id: 'order_del_double',
      customer_name: 'Двойной',
      customer_email: 'd@x.com',
      delivery_type: 'pickup',
      items_json: '[]',
      total: 0,
      status: 'new',
      payment_method: 'manual',
      created_at: Date.now(),
      updated_at: Date.now(),
    })
    const event = { context: {}, params: { id: 'order_del_double' } } as never

    const first = await handler(event)
    expect(first).toEqual({ ok: true })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Заказ не найден',
    })
  })

  it('DELETE с SQL-injection в id не ломает таблицу и возвращает 404', async () => {
    const before = getDb()
      .prepare('SELECT COUNT(*) as c FROM orders')
      .get() as { c: number }

    const event = {
      context: {},
      params: { id: "x'; DROP TABLE orders; --" },
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
    })

    const after = getDb()
      .prepare('SELECT COUNT(*) as c FROM orders')
      .get() as { c: number }
    expect(after.c).toBe(before.c)
    expect(after.c).toBeGreaterThan(0)
  })

  it('DELETE без id возвращает 400', async () => {
    const event = {
      context: {},
      params: {},
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'id обязателен',
    })
  })

  it('если requireAuth бросает 401 — запрос не доходит до БД', async () => {
    requireAuthMock.mockImplementationOnce(() => {
      throw new Error('Unauthorized') as Error & { statusCode: number }
    })
    const event = {
      context: {},
      params: { id: 'order_del_1' },
    } as never
    await expect(handler(event)).rejects.toThrow('Unauthorized')
  })
})
