import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { applyMigrations, insertFullOrder, setupTestDb } from '../../__tests__/helpers/db'

const TEST_DIR = resolve(process.cwd(), 'tmp-server-tests/orders-payment-method')

beforeAll(() => {
  setupTestDb(TEST_DIR, 'test-orders-payment-method.db')
})

afterAll(() => {
  rmSync(TEST_DIR, { recursive: true, force: true })
})

describe('PATCH /api/orders/[id]/payment-method', () => {
  let getDb: typeof import('../../../utils/db').getDb
  let closeDb: typeof import('../../../utils/db').closeDb
  let handler: typeof import('../../../api/orders/[id]/payment-method.patch').default

  beforeAll(async () => {
    const dbModule = await import('../../../utils/db')
    getDb = dbModule.getDb
    closeDb = dbModule.closeDb

    applyMigrations(getDb())

    insertFullOrder(getDb(), {
      id: 'pm_yookassa_new',
      customer_name: 'Петя',
      customer_email: 'petya@example.com',
      delivery_type: 'pickup',
      items_json: JSON.stringify([{ productId: '1', title: 'X', price: 100, amount: 1 }]),
      total: 100,
      status: 'new',
      payment_method: 'yookassa',
      created_at: Date.now(),
      updated_at: Date.now(),
    })

    insertFullOrder(getDb(), {
      id: 'pm_yookassa_paid',
      customer_name: 'Маша',
      customer_email: 'masha@example.com',
      delivery_type: 'pickup',
      items_json: JSON.stringify([]),
      total: 200,
      status: 'paid',
      payment_method: 'yookassa',
      created_at: Date.now(),
      updated_at: Date.now(),
    })

    handler = (await import('../../../api/orders/[id]/payment-method.patch')).default
  })

  afterAll(() => {
    closeDb()
  })

  it('меняет payment_method на manual для заказа в статусе new', async () => {
    const event = {
      context: {},
      params: { id: 'pm_yookassa_new' },
      body: { paymentMethod: 'manual' },
    } as never

    const result = await handler(event)
    expect(result).toEqual({ ok: true, paymentMethod: 'manual' })

    const order = getDb()
      .prepare('SELECT payment_method FROM orders WHERE id = ?')
      .get('pm_yookassa_new') as { payment_method: string }
    expect(order.payment_method).toBe('manual')
  })

  it('запрещает менять для заказа в статусе paid (409)', async () => {
    const event = {
      context: {},
      params: { id: 'pm_yookassa_paid' },
      body: { paymentMethod: 'manual' },
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 409,
    })

    const order = getDb()
      .prepare('SELECT payment_method FROM orders WHERE id = ?')
      .get('pm_yookassa_paid') as { payment_method: string }
    expect(order.payment_method).toBe('yookassa')
  })

  it('404 для несуществующего заказа', async () => {
    const event = {
      context: {},
      params: { id: 'missing_order' },
      body: { paymentMethod: 'manual' },
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('400 если paymentMethod !== "manual"', async () => {
    const event = {
      context: {},
      params: { id: 'pm_yookassa_new' },
      body: { paymentMethod: 'yookassa' },
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it('400 если paymentMethod отсутствует', async () => {
    const event = {
      context: {},
      params: { id: 'pm_yookassa_new' },
      body: {},
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it('400 без id в params', async () => {
    const event = {
      context: {},
      params: {},
      body: { paymentMethod: 'manual' },
    } as never

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
    })
  })
})