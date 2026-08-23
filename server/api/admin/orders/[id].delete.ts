import { getDb } from '../../../utils/db'
import { requireAuth } from '../../../utils/requireAuth'

// Заказы со статусом paid/shipped можно удалить через API напрямую,
// хотя UI-кнопка скрыта (см. app/constants/orderPermissions.ts).
// Это намеренно: refund / chargeback сценарии требуют ручного удаления.
// Если когда-нибудь понадобится жёсткий guard — добавить 409 для
// status ∉ ['new', 'cancelled'] здесь.
export default defineEventHandler((event) => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id обязателен' })

  let info: { changes: number }
  try {
    const sql = 'DELETE FROM orders WHERE id = ?'
    // eslint-disable-next-line no-console
    console.log('[orders.delete] sql=', JSON.stringify(sql), 'id=', JSON.stringify(id), 'typeof=', typeof id, 'len=', id.length)
    info = getDb().prepare(sql).run(id)
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
