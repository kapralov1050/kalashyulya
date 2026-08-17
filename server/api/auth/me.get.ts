import { getDb } from '../../utils/db'

export interface AuthUserDto {
  id: number
  email: string
  name: string | null
}

interface MeResponse {
  user: AuthUserDto | null
}

export default defineEventHandler((event): MeResponse => {
  const sessionId = getCookie(event, 'session_id')
  if (!sessionId) return { user: null }

  const row = getDb()
    .prepare(
      `SELECT u.id, u.email, u.name
         FROM sessions s
         JOIN admin_users u ON u.id = s.user_id
        WHERE s.id = ? AND s.expires_at > ?`,
    )
    .get(sessionId, Date.now()) as AuthUserDto | undefined

  return { user: row ?? null }
})