import type { OrderInBase } from '~/types'
import { getDb } from '../../utils/db'

interface OrderRow {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  customer_messenger: string | null
  customer_nickname: string | null
  city: string | null
  address: string | null
  delivery_type: 'pickup' | 'delivery' | null
  delivery_recipient: string | null
  delivery_street: string | null
  delivery_house: string | null
  delivery_apartment: string | null
  items_json: string
  total: number
  status: 'new' | 'paid' | 'shipped' | 'cancelled'
  payment_method: 'yookassa' | 'manual' | null
  comment: string | null
  created_at: number
  updated_at: number
  framing: 'none' | 'simple' | 'premium' | null
  payment_id: string | null
  notification_failed: string | null
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый заказ',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  cancelled: 'Отменён',
}

/**
 * Нормализует пользовательский ввод: убирает пробелы по краям, ведущие `#`
 * (id из email вида `#20260825-04bb9555`), приводит к lowercase (hex-часть
 * всегда в нижнем регистре).
 */
function normalize(input: string): string {
  return input.trim().replace(/^#+/, '').toLowerCase()
}

function rowToOrderInBase(r: OrderRow): OrderInBase {
  return {
    id: r.id,
    customer: {
      name: r.customer_name,
      email: r.customer_email,
      phone: r.customer_phone ?? '',
      userMessenger: r.customer_messenger ?? '',
      userNickname: r.customer_nickname ?? '',
      delivery: {
        type: r.delivery_type ?? 'pickup',
        city: r.city ?? '',
        recipient: r.delivery_recipient ?? '',
        address: r.address ?? '',
        street: r.delivery_street ?? '',
        house: r.delivery_house ?? '',
        apartment: r.delivery_apartment ?? '',
      },
    },
    purchase: {
      order: JSON.parse(r.items_json) as OrderInBase['purchase']['order'],
      createdAt: new Date(r.created_at).toISOString(),
    },
    totalPrice: r.total,
    status: r.status,
    statusLabel: STATUS_LABELS[r.status] ?? r.status,
    framing: r.framing ?? undefined,
    paymentMethod: r.payment_method ?? 'manual',
    paymentId: r.payment_id ?? '',
    notificationFailed: r.notification_failed
      ? (JSON.parse(r.notification_failed) as {
          telegram: boolean
          email: boolean
        })
      : null,
  }
}

/**
 * GET /api/orders/search?number=...
 *
 * Публичный endpoint для /shop/tracking. Ищет заказ по `id` (то, что
 * пользователь видит в email как `#20260825-04bb9555`) ИЛИ по `payment_id`
 * (YooKassa). Возвращает `null` если ничего не найдено (НЕ 404 —
 * клиент сам показывает "не найден"), иначе маскированный OrderInBase.
 *
 * Возвращаем ТОЛЬКО маскированные ПД не нужно — маскирование делается на
 * клиенте через ~/utils/mask. Здесь мы отдаём сырой OrderInBase и полагаемся
 * на то, что клиент применит те же `mask*`-функции. Это согласуется с
 * /api/orders (admin/dashboard использует сырые данные).
 *
 * Rate-limit на клиенте (useRateLimit в tracking.vue): 5 попыток / 15 мин.
 * На сервере дополнительный rate-limit пока не добавляем (см. задачу).
 */
export default defineEventHandler((event): OrderInBase | null => {
  const raw = (getQuery(event).number as string | undefined) ?? ''
  const normalized = normalize(raw)
  if (!normalized) {
    throw createError({
      statusCode: 400,
      statusMessage: 'number required',
    })
  }

  const row = getDb()
    .prepare(
      `SELECT * FROM orders
       WHERE LOWER(id) = ?
          OR LOWER(IFNULL(payment_id, '')) = ?
       LIMIT 1`,
    )
    .get(normalized, normalized) as OrderRow | undefined

  if (!row) return null
  return rowToOrderInBase(row)
})
