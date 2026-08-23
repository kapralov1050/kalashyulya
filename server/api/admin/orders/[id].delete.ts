import { getDb } from '../../../utils/db'
import { requireAuth } from '../../../utils/requireAuth'

// Заказы со статусом paid/shipped можно удалить через API напрямую,
// хотя UI-кнопка скрыта (см. OrdersList.vue:DELETABLE_STATUSES).
// Это намеренно: refund / chargeback сценарии требуют ручного удаления.
// Если когда-нибудь понадобится жёсткий guard — добавить 409 для
// status ∉ ['new', 'cancelled'] здесь.
export default defineEventHandler((event) => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id обязателен' })

  try {
    const info = getDb().prepare('DELETE FROM orders WHERE id = ?').run(id)
    if (info.changes === 0) {
      throw createError({ statusCode: 404, message: 'Заказ не найден' })
    }
    return { ok: true }
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    // eslint-disable-next-line no-console
    console.error('[orders.delete] db error:', error)
    throw createError({ statusCode: 500, message: 'Ошибка сервера' })
  }
})
