/**
 * Чистые функции-мапперы из формата Firebase в формат SQLite.
 * Используются в scripts/migrate-firebase-to-sqlite.ts и покрыты unit-тестами.
 */

export type SqlOrderStatus = 'new' | 'paid' | 'shipped' | 'cancelled'
export type SqlProductStatus = 'available' | 'sold' | 'reserved'
export type SqlExhibitionStatus = 'draft' | 'published'

const ORDER_STATUS_MAP: Record<string, SqlOrderStatus> = {
  'Новый заказ': 'new',
  'В работе': 'new',
  'Оплачен': 'paid',
  'Отправлен': 'shipped',
  new: 'new',
  paid: 'paid',
  shipped: 'shipped',
  cancelled: 'cancelled',
}

export function mapOrderStatus(fb: string | undefined): SqlOrderStatus {
  if (!fb) return 'new'
  return ORDER_STATUS_MAP[fb] ?? 'new'
}

export function mapProductStatus(p: {
  isReserved?: boolean
  stock?: number
}): SqlProductStatus {
  if (p.isReserved) return 'reserved'
  if (typeof p.stock === 'number' && p.stock <= 0) return 'sold'
  return 'available'
}

export interface FbOrderItem {
  id?: string | number
  title?: string
  price?: number
  amount?: number
  quantity?: number
}

export function mapOrderItems(items: FbOrderItem[] = []) {
  return items.map(i => ({
    productId: i.id !== undefined ? String(i.id) : (i.title ?? ''),
    title: i.title ?? '',
    price: i.price ?? 0,
    qty: i.amount ?? i.quantity ?? 1,
  }))
}

/**
 * Резолвит productId для item заказа: берёт из самого item.id если есть,
 * иначе ищет в titleMap (title → productId из коллекции products).
 * Иначе фолбэк на title.
 */
export function resolveOrderItemProductId(
  item: FbOrderItem,
  titleMap: Map<string, string>,
): string {
  if (item.id !== undefined && item.id !== null) return String(item.id)
  if (item.title && titleMap.has(item.title.trim())) {
    return titleMap.get(item.title.trim())!
  }
  return item.title ?? ''
}

export function buildExhibitionLocation(loc: {
  venue?: string
  city?: string
  address?: string
  addressLine?: string
} | undefined): string | null {
  if (!loc) return null
  const parts = [loc.venue, loc.city, loc.addressLine ?? loc.address]
    .filter(Boolean)
    .join(', ')
  return parts || null
}

export function mapExhibitionStatus(fb: string | undefined): SqlExhibitionStatus {
  return fb === 'published' || fb === 'ongoing' ? 'published' : 'draft'
}

/**
 * Обратный маппинг для DTO (SQL → Exhibition shape из app/types).
 * DB 'published' ↔ 'ongoing', DB 'draft' ↔ 'planned'/'finished'.
 * Без доп.колонки о distinction planned/finished невозможен,
 * считаем draft → planned, а finished выводится из даты окончания.
 */
export function exhibitionStatusToDto(
  status: SqlExhibitionStatus | string | null | undefined,
  dateEnd?: string | null,
): 'planned' | 'ongoing' | 'finished' {
  if (status === 'published' || status === 'ongoing') return 'ongoing'
  if (dateEnd) {
    const end = Date.parse(dateEnd)
    if (!Number.isNaN(end) && end < Date.now()) return 'finished'
  }
  return 'planned'
}

export function buildExhibitionDescription(e: {
  descriptionIntro?: string
  descriptionBody?: string
}): string | null {
  const parts = [e.descriptionIntro, e.descriptionBody].filter(Boolean)
  return parts.length ? parts.join('\n\n') : null
}

/**
 * Безопасный JSON.parse для колонок, которые могут быть NULL или пустой строкой.
 * Возвращает fallback, если строка невалидна.
 */
export function safeJsonParse<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback
  try {
    return JSON.parse(s) as T
  }
  catch {
    return fallback
  }
}