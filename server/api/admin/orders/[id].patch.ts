import { getDb } from '../../../utils/db'
import { requireAuth } from '../../../utils/requireAuth'

const ALLOWED = ['new', 'paid', 'shipped', 'cancelled'] as const

interface PatchBody {
  status: typeof ALLOWED[number]
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id обязателен' })

  const body = await readBody<PatchBody>(event)
  if (!body || !ALLOWED.includes(body.status)) {
    throw createError({
      statusCode: 400,
      message: `status должен быть одним из: ${ALLOWED.join(', ')}`,
    })
  }

  const info = getDb()
    .prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?')
    .run(body.status, Date.now(), id)

  if (info.changes === 0) {
    throw createError({ statusCode: 404, message: 'Заказ не найден' })
  }

  return { ok: true }
})