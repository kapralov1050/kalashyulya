import Database from 'better-sqlite3'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const DB_PATH = process.env.SQLITE_PATH || resolve(process.cwd(), 'data/data.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  mkdirSync(dirname(DB_PATH), { recursive: true })
  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')     // concurrency на чтение
  _db.pragma('foreign_keys = ON')
  _db.pragma('synchronous = NORMAL')   // компромисс скорость/надёжность
  applyMigrations()
  return _db
}

/**
 * Парсит .sql-файл с ALTER TABLE-выражениями и применяет только те,
 * которые ещё не выполнены. SQLite не умеет `ADD COLUMN IF NOT EXISTS`,
 * поэтому используется pragma table_info + conditional ALTER.
 *
 * Файл 001_init.sql идёт через `db.exec()` целиком (там CREATE TABLE IF NOT EXISTS).
 */
function applyAlterFile(db: Database.Database, filePath: string) {
  const raw = readFileSync(filePath, 'utf-8')
  // Удаляем комментарии и пустые строки, потом режем по ';'
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
      if (!column || !table) continue
      const cols = db.pragma(`table_info(${table})`) as Array<{ name: string }>
      if (cols.some(c => c.name === column)) continue
    }
    try {
      db.exec(stmt + ';')
    }
    catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // Идемпотентность: повторный ALTER с тем же CREATE INDEX/уникальным ограничением
      if (/already exists|duplicate column/i.test(msg)) continue
      throw err
    }
  }
}

function applyMigrations() {
  const db = getDb()
  const schemaDir = join(process.cwd(), 'server/schema')
  const initPath = join(schemaDir, '001_init.sql')
  db.exec(readFileSync(initPath, 'utf-8'))

  // Последующие миграции: ALTER TABLE и CREATE INDEX (idempotent через table_info).
  // Каждый файл применяется через applyAlterFile, который skip-ает уже выполненные ALTER
  // (через PRAGMA table_info) и CREATE INDEX (через try/catch по "already exists").
  for (const file of ['002_exhibitions.sql', '003_orders.sql']) {
    try {
      applyAlterFile(db, join(schemaDir, file))
    }
    catch (err) {
      if (!(err instanceof Error && /ENOENT/.test(err.message))) throw err
    }
  }
}

export function closeDb() {
  if (_db) { _db.close(); _db = null }
}