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
  comment: string | null
  created_at: number
  updated_at: number
}

/**
 * Возвращает заказы в формате OrderInBase (Firebase-era shape), чтобы UI
 * (admin/dashboard/OrdersList, /shop/tracking, /shop/payment-success) не
 * переписывать. Phase D: добавлены customer_messenger/nickname и
 * delivery.type/recipient/street/house/apartment — всё что было в Firebase.
 */
export default defineEventHandler((event): OrderInBase[] => {
  const status = getQuery(event).status as string | undefined
  const sql = status
    ? 'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC'
    : 'SELECT * FROM orders ORDER BY created_at DESC'
  const rows = (status
    ? getDb().prepare(sql).all(status)
    : getDb().prepare(sql).all()) as OrderRow[]

  return rows.map((r) => {
    const order: OrderInBase = {
      // r.id is TEXT in SQLite ("order_<ts>" или "YYYYMMDD-<hex>"),
      // OrderInBase заявляет number — Firebase-era shape где id = unix-ms.
      // На prod в БД id всегда string, поэтому кастуем. В UI это нечисловое
      // значение не вызывает ошибок (используется только в :key и текстом).
      id: Number(r.id) || 0 as unknown as never,
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
      paymentMethod: 'manual',
      paymentId: '',
      notificationFailed: { telegram: false, email: false },
    }
    return order
  })
})