import bcrypt from 'bcryptjs'
import { getDb, closeDb } from '../utils/db'

const EMAIL = process.env.ADMIN_EMAIL ?? 'admin@kalashyulya.ru'
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'changeme123'
const NAME = process.env.ADMIN_NAME ?? 'Admin'

const db = getDb()

const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(EMAIL) as
  | { id: number }
  | undefined

if (existing) {
  console.log(`User ${EMAIL} already exists (id=${existing.id}). Use --force to reset password.`)
  if (!process.argv.includes('--force')) {
    closeDb()
    process.exit(0)
  }
  const hash = bcrypt.hashSync(PASSWORD, 10)
  db.prepare('UPDATE admin_users SET password_hash = ?, name = ? WHERE email = ?').run(hash, NAME, EMAIL)
  console.log(`Password reset for ${EMAIL}`)
} else {
  const hash = bcrypt.hashSync(PASSWORD, 10)
  const info = db
    .prepare('INSERT INTO admin_users (email, password_hash, name, created_at) VALUES (?, ?, ?, ?)')
    .run(EMAIL, hash, NAME, Date.now())
  console.log(`Created admin user ${EMAIL} (id=${info.lastInsertRowid})`)
}

closeDb()
console.log(`\nLogin: ${EMAIL}`)
console.log(`Password: ${PASSWORD}`)
console.log('\n⚠️  Смени пароль после первого входа (UI для смены — TODO).')