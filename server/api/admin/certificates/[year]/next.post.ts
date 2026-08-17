import { getDb } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/requireAuth'

export default defineEventHandler((event): { count: number, id: string } => {
  requireAuth(event)
  const year = Number(getRouterParam(event, 'year'))
  if (!Number.isInteger(year) || year < 2000 || year > 3000) {
    throw createError({ statusCode: 400, message: 'Некорректный год' })
  }

  const db = getDb()
  const row = db
    .prepare('SELECT COUNT(*) as count FROM products WHERE certificate_id LIKE ?')
    .get(`JK-${year}-%`) as { count: number }

  const next = row.count + 1
  const id = `JK-${year}-${String(next).padStart(3, '0')}`
  return { count: next, id }
})