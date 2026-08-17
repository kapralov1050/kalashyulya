import type { OrderInBase } from '~/types'
import { getDb } from '../utils/db'

interface OrderRow {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  city: string | null
  address: string | null
  items_json: string
  total: number
  status: 'new' | 'paid' | 'shipped' | 'cancelled'
  comment: string | null
  created_at: number
  updated_at: number
}

/**
 * Возвращает заказы в формате, совместимом с OrderInBase (Firebase-era shape).
 *
 * Чтобы UI (admin/dashboard/OrdersList, /shop/tracking, /shop/payment-success)
 * остался работоспособным без больших рефакторингов, DTO транслируется
 * из плоской SQLite-строки в исходную nested-структуру.
 *
 * Если добавляются поля в OrderRow (например phone, address), их нужно
 * тоже проставить в этот маппер.
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
    id: r.id,
    customer: {
      name: r.customer_name,
      email: r.customer_email,
      phone: r.customer_phone ?? '',
      userMessenger: '',
      userNickname: '',
      delivery: {
        type: 'pickup',
        recipient: '',
        city: r.city ?? '',
        street: '',
        house: '',
        apartment: '',
        address: r.address ?? '',
      },
    },
    purchase: {
      order: JSON.parse(r.items_json) as OrderInBase['purchase']['order'],
      createdAt: new Date(r.created_at).toISOString(),
    },
    totalPrice: r.total,
    framing: '',
    paymentMethod: 'manual',
    notificationFailed: { telegram: false, email: false },
    status: r.status,
    paymentId: '',
  } as unknown as OrderInBase))
})