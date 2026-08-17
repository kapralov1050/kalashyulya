import type { H3Event } from 'h3'
import type { Order, ShortPurchaseInfo } from '~/types'
import { randomBytes } from 'node:crypto'
import { getDb } from '../utils/db'

interface CreateOrderResponse {
  id: string
  total: number
}

async function triggerOrderNotifications(
  event: H3Event,
  orderId: string,
  orderData: Order,
  totalPrice: number,
): Promise<{ telegram: boolean; email: boolean }> {
  const telegramPromise = $fetch
    .raw('/api/notifications/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { orderId, orderData, totalPrice },
      baseURL: getRequestURL(event).origin,
    })
    .then(() => true)
    .catch(() => false)

  const emailPromise = $fetch
    .raw('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { orderData },
      baseURL: getRequestURL(event).origin,
    })
    .then(() => true)
    .catch(() => false)

  const [telegram, email] = await Promise.all([
    telegramPromise,
    emailPromise,
  ])
  return { telegram, email }
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
        (id, customer_name, customer_email, customer_phone,
         customer_messenger, customer_nickname,
         city, address,
         delivery_type, delivery_recipient, delivery_street, delivery_house, delivery_apartment,
         items_json, total, status, comment, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      body.customer.name,
      body.customer.email,
      body.customer.phone ?? null,
      body.customer.userMessenger ?? null,
      body.customer.userNickname ?? null,
      body.customer.delivery?.city ?? null,
      body.customer.delivery?.address ?? null,
      body.customer.delivery?.type ?? null,
      body.customer.delivery?.recipient ?? null,
      body.customer.delivery?.street ?? null,
      body.customer.delivery?.house ?? null,
      body.customer.delivery?.apartment ?? null,
      JSON.stringify(items),
      total,
      null,
      now,
      now,
    )

  // Server-side уведомления: выполняем best-effort параллельно,
  // не блокируем ответ клиенту при ошибках отдельных каналов.
  void triggerOrderNotifications(event, id, body, total).catch(() => {
    /* noop — best-effort */
  })

  return { id, total }
})
