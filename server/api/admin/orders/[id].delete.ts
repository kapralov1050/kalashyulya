import { getDb } from '../../../utils/db'
import { requireAuth } from '../../../utils/requireAuth'

// Заказы со статусом paid/shipped можно удалить через API напрямую,
// хотя UI-кнопка скрыта (см. app/constants/orderPermissions.ts).
// Это намеренно: refund / chargeback сценарии требуют ручного удаления.
// Если когда-нибудь понадобится жёсткий guard — добавить 409 для
// status ∉ ['new', 'cancelled'] здесь.
export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id обязателен' })

  let info: { changes: number }
  try {
    info = getDb().prepare('DELETE FROM orders WHERE id = ?').run(id)
  }
  catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('[orders.delete] db error:', error)
    throw createError({ statusCode: 500, message: 'Ошибка сервера' })
  }

  if (info.changes === 0) {
    throw createError({ statusCode: 404, message: 'Заказ не найден' })
  }
  return { ok: true }
})
