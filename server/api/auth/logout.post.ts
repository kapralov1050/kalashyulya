import { getDb } from '../../utils/db'

export default defineEventHandler((event): { success: true } => {
  const sessionId = getCookie(event, 'session_id')
  if (sessionId) {
    getDb().prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
  }
  deleteCookie(event, 'session_id', { path: '/' })
  return { success: true }
})