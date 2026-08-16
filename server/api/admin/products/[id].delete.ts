import { getDb } from '../../../utils/db'
import { requireAuth } from '../../../utils/requireAuth'

export default defineEventHandler((event) => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id обязателен' })

  const info = getDb().prepare('DELETE FROM products WHERE id = ?').run(id)
  if (info.changes === 0) {
    throw createError({ statusCode: 404, message: 'Товар не найден' })
  }
  return { ok: true }
})