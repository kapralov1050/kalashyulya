import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdirSync, rmSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import type Database from 'better-sqlite3'

;(globalThis as Record<string, unknown>).getRouterParam = (
  event: { context?: { params?: Record<string, string> }, params?: Record<string, string> },
  name: string,
) => (event?.context?.params ?? event?.params ?? {})[name]

const TEST_DIR = resolve(process.cwd(), 'tmp-server-tests')
const TEST_DB = resolve(TEST_DIR, 'test-orders-patch.db')

function applyMigrations(db: Database.Database) {
  const schemaDir = resolve(process.cwd(), 'server/schema')
  const initPath = join(schemaDir, '001_init.sql')
  db.exec(readFileSync(initPath, 'utf-8'))

  for (const file of ['002_exhibitions.sql', '003_orders.sql', '004_orders.sql', '005_orders.sql']) {
    const path = join(schemaDir, file)
    try {
      const raw = readFileSync(path, 'utf-8')
      const stripped = raw
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
      const statements = stripped
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      for (const stmt of statements) {
        const columnMatch = stmt.match(/^ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+(\w+)\s+/i)
        if (columnMatch) {
          const [, table, column] = columnMatch
          const cols = db.pragma(`table_info(${table})`) as Array<{ name: string }>
          if (cols.some(c => c.name === column)) continue
        }
        try {
          db.exec(stmt + ';')
        }
        catch {
          // idempotent: skip already exists / duplicate column
        }
      }
    }
    catch {
      // ignore missing files
    }
  }
}

beforeAll(() => {
  mkdirSync(TEST_DIR, { recursive: true })
  process.env.SQLITE_PATH = TEST_DB
  process.env.NODE_ENV = 'test'
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

    getDb().prepare(`
      INSERT INTO orders (id, customer_name, customer_email, customer_phone,
                          customer_messenger, customer_nickname,
                          city, address,
                          delivery_type, delivery_recipient, delivery_street, delivery_house, delivery_apartment,
                          items_json, total, status, payment_method, comment, created_at, updated_at,
                          framing, payment_id, notification_failed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'order_patch_1',
      'Петя',
      'petya@example.com',
      null,
      null,
      null,
      null,
      null,
      'pickup',
      null,
      null,
      null,
      null,
      JSON.stringify([{ productId: '1', title: 'X', price: 100, amount: 1 }]),
      100,
      'new',
      'manual',
      null,
      Date.now(),
      Date.now(),
      null,
      null,
      null,
    )

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
