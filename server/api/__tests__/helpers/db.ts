import { mkdirSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import type Database from 'better-sqlite3'

export function applyMigrations(db: Database.Database): void {
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

export function setupTestDb(dir: string, dbName: string): void {
  mkdirSync(dir, { recursive: true })
  process.env.SQLITE_PATH = resolve(dir, dbName)
  process.env.NODE_ENV = 'test'
}

export const FULL_ORDER_COLUMNS = [
  'id',
  'customer_name',
  'customer_email',
  'customer_phone',
  'customer_messenger',
  'customer_nickname',
  'city',
  'address',
  'delivery_type',
  'delivery_recipient',
  'delivery_street',
  'delivery_house',
  'delivery_apartment',
  'items_json',
  'total',
  'status',
  'payment_method',
  'comment',
  'created_at',
  'updated_at',
  'framing',
  'payment_id',
  'notification_failed',
]

export function insertFullOrder(
  db: Database.Database,
  row: Record<string, unknown>,
): void {
  const cols = FULL_ORDER_COLUMNS
  const placeholders = cols.map(() => '?').join(', ')
  db.prepare(`INSERT INTO orders (${cols.join(', ')}) VALUES (${placeholders})`)
    .run(...cols.map(c => row[c] ?? null))
}
