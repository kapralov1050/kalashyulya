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

function applyMigrations() {
  const db = getDb()
  const schemaPath = join(process.cwd(), 'server/schema/001_init.sql')
  db.exec(readFileSync(schemaPath, 'utf-8'))
}

export function closeDb() {
  if (_db) { _db.close(); _db = null }
}