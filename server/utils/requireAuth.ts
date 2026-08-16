import type { H3Event } from 'h3'
import { getDb } from './db'

export interface AuthenticatedUser {
  id: number
  email: string
  name: string | null
}

export function requireAuth(event: H3Event): AuthenticatedUser {
  const sessionId = getCookie(event, 'session_id')
  if (!sessionId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const row = getDb()
    .prepare(
      `SELECT u.id, u.email, u.name
         FROM sessions s
         JOIN admin_users u ON u.id = s.user_id
        WHERE s.id = ? AND s.expires_at > ?`,
    )
    .get(sessionId, Date.now()) as AuthenticatedUser | undefined

  if (!row) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  return row
}