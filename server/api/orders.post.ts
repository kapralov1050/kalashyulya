import type { Order, ShortPurchaseInfo } from '~/types'
import { randomBytes } from 'node:crypto'
import { getDb } from '../utils/db'

interface CreateOrderResponse {
  id: string
  total: number
}

export default defineEventHandler(async (event): Promise<CreateOrderResponse> => {
  const body = await readBody<Order>(event)

  if (
    !body ||
    !body.customer ||
    !body.purchase ||
    typeof body.totalPrice !== 'number' ||
    !Array.isArray(body.purchase.order) ||
    body.purchase.order.length === 0
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректные данные заказа' })
  }
  if (!body.customer.email || !body.customer.name) {
    throw createError({ statusCode: 400, statusMessage: 'Email и имя обязательны' })
  }

  const items = body.purchase.order.map((i: ShortPurchaseInfo) => ({
    productId: String(i.id),
    title: i.title,
    price: i.price,
    qty: i.amount,
  }))
  const total = body.totalPrice
  const id = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomBytes(4).toString('hex')}`
  const now = Date.now()

  getDb()
    .prepare(
      `INSERT INTO orders
        (id, customer_name, customer_email, customer_phone, city, address,
         items_json, total, status, comment, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?)`,
    )
    .run(
      id,
      body.customer.name,
      body.customer.email,
      body.customer.phone ?? null,
      body.customer.delivery?.city ?? null,
      body.customer.delivery?.address ?? null,
      JSON.stringify(items),
      total,
      null,
      now,
      now,
    )

  return { id, total }
})