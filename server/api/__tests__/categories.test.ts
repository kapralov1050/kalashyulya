import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const TEST_DIR = resolve(process.cwd(), 'tmp-server-tests')
const TEST_DB = resolve(TEST_DIR, 'test-categories.db')

beforeAll(() => {
  mkdirSync(TEST_DIR, { recursive: true })
  process.env.SQLITE_PATH = TEST_DB
  process.env.NODE_ENV = 'test'
})

afterAll(() => {
  rmSync(TEST_DIR, { recursive: true, force: true })
})

describe('GET /api/categories', () => {
  let getDb: typeof import('../../utils/db').getDb
  let closeDb: typeof import('../../utils/db').closeDb
  let handler: typeof import('../categories.get').default

  beforeAll(async () => {
    const dbModule = await import('../../utils/db')
    getDb = dbModule.getDb
    closeDb = dbModule.closeDb

    // Схема через applyMigrations() (categories в 001_init.sql).
    // Сидим данные как Firebase-миграция:
    getDb().exec('DELETE FROM categories')
    const insert = getDb().prepare(
      `INSERT INTO categories (id, name, "order") VALUES (?, ?, ?)`,
    )
    // /shop/categories — массив, id = category_<order>
    const cats = [
      { name: 'watercolor', order: 1 },
      { name: 'sketches', order: 2 },
      { name: 'postcards', order: 3 },
    ]
    const tx = getDb().transaction(() => {
      for (const c of cats) insert.run(`category_${c.order}`, c.name, c.order)
    })
    tx()

    handler = (await import('../categories.get')).default
  })

  afterAll(() => closeDb())

  it('возвращает категории отсортированные по order', async () => {
    const fakeEvent = { context: {} } as unknown as Parameters<typeof handler>[0]
    const result = await handler(fakeEvent)
    expect(result).toHaveLength(3)
    expect(result.map((c: { name: string }) => c.name)).toEqual([
      'watercolor',
      'sketches',
      'postcards',
    ])
  })

  it('id имеет префикс category_ (Phase D convention)', async () => {
    const fakeEvent = { context: {} } as unknown as Parameters<typeof handler>[0]
    const result = await handler(fakeEvent)
    expect(result[0]!.id).toBe('category_1')
  })

  it('возвращает [] если категорий нет', async () => {
    getDb().exec('DELETE FROM categories')
    const fakeEvent = { context: {} } as unknown as Parameters<typeof handler>[0]
    const result = await handler(fakeEvent)
    expect(result).toEqual([])
    // restore
    getDb().prepare('INSERT INTO categories (id, name, "order") VALUES (?, ?, ?)').run('category_1', 'x', 1)
  })
})