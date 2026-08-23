import type { H3Event } from 'h3'
import type { Order, ShortPurchaseInfo } from '~/types'
import { randomBytes } from 'node:crypto'
import { getDb } from '../utils/db'
// В production (Nitro) $fetch — global auto-import; здесь нужно для тестов (vi.mock 'ofetch').
import { $fetch } from 'ofetch'

interface CreateOrderResponse {
  id: string
  total: number
}

async function triggerNotification(
  event: H3Event,
  endpoint: string,
  body: Record<string, unknown>,
  successKey: 'success' | 'ok',
): Promise<boolean> {
  // eslint-disable-next-line no-console
  console.log('[DEBUG triggerNotification] $fetch type:', typeof $fetch, '$fetch.raw type:', typeof $fetch.raw)
  try {
    const result = await $fetch.raw<Record<string, unknown>>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      baseURL: getRequestURL(event).origin,
    })
    // Phase D back-compat: проверяем явный success/key в response body,
    // а не только HTTP 200. Иначе Telegram-нотификация с зафейленными
    // credentials даст HTTP 200 + {ok:false} и будет ошибочно считаться успешной.
    return result._data?.[successKey] === true
  }
  catch (error) {
    // Логируем, чтобы пропавшие уведомления были диагностируемы.
    // eslint-disable-next-line no-console
    console.error(`[orders.post] ${endpoint} failed:`, error)
    return false
  }
}

async function triggerOrderNotifications(
  event: H3Event,
  orderId: string,
  orderData: Order,
  totalPrice: number,
): Promise<{ telegram: boolean; email: boolean }> {
  const [telegram, email] = await Promise.all([
    triggerNotification(event, '/api/notifications/telegram', {
      orderId,
      orderData,
      totalPrice,
    }, 'success'),
    triggerNotification(event, '/api/notifications/email', {
      orderId,
      orderData,
    }, 'ok'),
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
    // Phase D back-compat: используем `amount` (Firebase-контракт) — фронт
    // читает это поле в OrdersList/StatusChangeModal/useOrderEmail.
    amount: i.amount,
  }))
  const total = body.totalPrice
  const id = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomBytes(4).toString('hex')}`
  const now = Date.now()

  // body.paymentMethod приходит с фронта ('yookassa' | 'manual'). Если null —
  // считаем manual (default для чекаута без онлайн-оплаты).
  const paymentMethod: 'yookassa' | 'manual' =
    body.paymentMethod === 'yookassa' ? 'yookassa' : 'manual'

  // Phase D-фикс #3: framing, payment_id, notification_failed теперь хранятся в БД.
  const framing: 'none' | 'simple' | 'premium' | null =
    body.framing === 'simple' || body.framing === 'premium' || body.framing === 'none'
      ? body.framing
      : null
  // paymentId: фронт сейчас не шлёт (нет webhook), сохраняем если передан.
  const paymentId: string | null = body.paymentId ?? null

  getDb()
    .prepare(
      `INSERT INTO orders
        (id, customer_name, customer_email, customer_phone,
         customer_messenger, customer_nickname,
         city, address,
         delivery_type, delivery_recipient, delivery_street, delivery_house, delivery_apartment,
         items_json, total, status, payment_method, comment, created_at, updated_at,
         framing, payment_id, notification_failed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      'new',
      paymentMethod,
      null,
      now,
      now,
      framing,
      paymentId,
      null,  // notification_failed заполнится после уведомлений
    )

  // Phase D-фикс #2: реальный статус уведомлений сохраняем в БД.
  // Раньше был hardcoded {false,false} → admin "Уведомление не отправлено" баннер был мёртвый.
  // Await блокирует ответ на ~100-500мс (Telegram/email best-effort), но даёт реальный
  // статус в админке. Без await notification_failed был бы всегда 'sending'/'pending' — не
  // помогает оператору понять, дошло ли уведомление.
  const notifResult = await triggerOrderNotifications(event, id, body, total)
  getDb()
    .prepare('UPDATE orders SET notification_failed = ? WHERE id = ?')
    .run(JSON.stringify(notifResult), id)

  return { id, total }
})
