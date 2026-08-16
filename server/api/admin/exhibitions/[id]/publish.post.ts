import { getDb } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/requireAuth'

export default defineEventHandler((event) => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id обязателен' })

  const info = getDb()
    .prepare(`UPDATE exhibitions SET status = 'published', updated_at = ? WHERE id = ?`)
    .run(Date.now(), id)

  if (info.changes === 0) {
    throw createError({ statusCode: 404, message: 'Выставка не найдена' })
  }

  return { ok: true }
})