import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'
import { getDb } from '../../utils/db'

interface LoginBody {
  email: string
  password: string
}

export interface UserDto {
  id: number
  email: string
  name: string | null
}

interface LoginResponse {
  user: UserDto
}

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  const body = await readBody<LoginBody>(event)
  if (!body?.email || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Email и пароль обязательны' })
  }

  const db = getDb()
  const row = db
    .prepare('SELECT id, email, name, password_hash FROM admin_users WHERE email = ?')
    .get(body.email) as
    | { id: number, email: string, name: string | null, password_hash: string }
    | undefined

  if (!row || !bcrypt.compareSync(body.password, row.password_hash)) {
    throw createError({ statusCode: 401, statusMessage: 'Неверные учётные данные' })
  }

  const sessionId = randomBytes(32).toString('base64url')
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(
    sessionId,
    row.id,
    expiresAt,
  )

  setCookie(event, 'session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return { user: { id: row.id, email: row.email, name: row.name } }
})