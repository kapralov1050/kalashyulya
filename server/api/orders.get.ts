import type { OrderInBase } from '~/types'
import { getDb } from '../utils/db'

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
  // Phase D-фикс #3: теперь читаются из БД, а не хардкодятся.
  framing: 'none' | 'simple' | 'premium' | null
  payment_id: string | null
  notification_failed: string | null  // JSON: '{"telegram":bool,"email":bool}'
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый заказ',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  cancelled: 'Отменён',
}

/**
 * Возвращает заказы в формате OrderInBase (Firebase-era shape) — чтобы UI
 * (admin/OrdersList, /shop/tracking, /shop/payment-success) не переписывать.
 * Phase D: добавлены customer_messenger/nickname и delivery.{type,recipient,street,house,apartment}.
 */
export default defineEventHandler((event): OrderInBase[] => {
  const status = getQuery(event).status as string | undefined
  const sql = status
    ? 'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC'
    : 'SELECT * FROM orders ORDER BY created_at DESC'
  const rows = (status
    ? getDb().prepare(sql).all(status)
    : getDb().prepare(sql).all()) as OrderRow[]

  return rows.map((r): OrderInBase => ({
    // r.id — TEXT в SQLite. OrderInBase.id теперь `number | string` — оба варианта
    // допустимы (Firebase использовал unix-ms число, SQLite сохранил как строку).
    // UI использует id только как :key/текст, формат не критичен.
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
    // Phase D-фикс #3: framing читается из БД, не хардкодится.
    framing: r.framing ?? undefined,
    paymentMethod: r.payment_method ?? 'manual',
    paymentId: r.payment_id ?? '',
    // notification_failed хранится в БД как JSON-строка ('{"telegram":true,"email":false}')
    // orders.post.ts пишет туда реальный результат triggerOrderNotifications.
    // Legacy-заказы (до Phase D-фикс) возвращают null — баннер не показывается.
    notificationFailed: r.notification_failed
      ? (JSON.parse(r.notification_failed) as { telegram: boolean, email: boolean })
      : null,
  }))
})