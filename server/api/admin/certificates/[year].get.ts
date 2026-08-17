import { getDb } from '../../../utils/db'
import { requireAuth } from '../../../utils/requireAuth'

export default defineEventHandler((event): { count: number } => {
  requireAuth(event)
  const year = Number(getRouterParam(event, 'year'))
  if (!Number.isInteger(year) || year < 2000 || year > 3000) {
    throw createError({ statusCode: 400, message: 'Некорректный год' })
  }

  const row = getDb()
    .prepare('SELECT COUNT(*) as count FROM products WHERE certificate_id LIKE ?')
    .get(`JK-${year}-%`) as { count: number }

  return { count: row.count }
})