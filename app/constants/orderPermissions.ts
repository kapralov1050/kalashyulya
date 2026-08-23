/**
 * Статусы заказов, для которых в админке можно удалить запись.
 * paid/shipped UI-кнопкой не удаляются (защита финансового audit-trail),
 * но endpoint остаётся доступным для refund/chargeback-сценариев.
 */
export const DELETABLE_SQL_STATUSES: ReadonlySet<string> = new Set([
  'new',
  'cancelled',
])

export function canDeleteOrder(status: string | null | undefined): boolean {
  if (!status) return false
  return DELETABLE_SQL_STATUSES.has(status)
}
