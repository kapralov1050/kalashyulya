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

export interface OrderItemDto {
  productId: string
  title: string
  price: number
  qty: number
}

export interface OrderDto {
  id: string
  customer: {
    name: string
    email: string
    phone: string | null
    city: string | null
    address: string | null
  }
  items: OrderItemDto[]
  total: number
  status: OrderRow['status']
  comment: string | null
  createdAt: number
  updatedAt: number
}

export default defineEventHandler((event): OrderDto[] => {
  const status = getQuery(event).status as string | undefined
  const sql = status
    ? 'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC'
    : 'SELECT * FROM orders ORDER BY created_at DESC'
  const rows = (status
    ? getDb().prepare(sql).all(status)
    : getDb().prepare(sql).all()) as OrderRow[]

  return rows.map((r): OrderDto => ({
    id: r.id,
    customer: {
      name: r.customer_name,
      email: r.customer_email,
      phone: r.customer_phone,
      city: r.city,
      address: r.address,
    },
    items: JSON.parse(r.items_json),
    total: r.total,
    status: r.status,
    comment: r.comment,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
})