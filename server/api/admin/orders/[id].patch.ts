/**
 * PATCH /api/admin/orders/:id — обновление статуса заказа админкой.
 *
 * Дополнительно (с email):
 *  - Принимает опциональное поле `message` (custom text для email покупателю).
 *  - Если `sendEmail` !== false (default true) — формирует и отправляет email
 *    покупателю с информацией о смене статуса через buildStatusEmailPayload +
 *    buildStatusEmailHtml (server/utils/statusEmailTemplate.ts).
 *  - Записывает результат в `orders.notification_failed` (merge с существующим
 *    значением — telegram-статус, если он был, не затирается).
 *
 * Auth: requireAuth.
 */
import { getDb } from '../../../utils/db'
import { requireAuth } from '../../../utils/requireAuth'
import {
  buildStatusEmailHtml,
  buildStatusEmailPayload,
} from '../../../utils/statusEmailTemplate'
import {
  getSmtpTransportConfig,
  sendViaSmtp,
} from '../../notifications/email.post'
import type { OrderInBase } from '~/types'

const ALLOWED = ['new', 'paid', 'shipped', 'cancelled'] as const
type OrderStatus = (typeof ALLOWED)[number]

interface PatchBody {
  status: OrderStatus
  sendEmail?: boolean
  message?: string
}

interface EmailResult {
  ok: boolean
  error?: string
}

interface PatchResult {
  ok: true
  status: OrderStatus
  email: EmailResult | null
  noChange?: boolean
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый заказ',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  cancelled: 'Отменён',
}

export default defineEventHandler(async (event): Promise<PatchResult> => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id обязателен' })
  }

  const body = await readBody<PatchBody>(event)
  if (!body || !ALLOWED.includes(body.status)) {
    throw createError({
      statusCode: 400,
      message: `status должен быть одним из: ${ALLOWED.join(', ')}`,
    })
  }

  // 1. Проверяем, что заказ существует. SQLite UPDATE возвращает changes=0
  // и при отсутствии строки, И при same-status PATCH — различить нельзя.
  // SELECT сначала → 404 если нет; same-status → return без UPDATE и email.
  const db = getDb()
  const existing = db
    .prepare('SELECT status FROM orders WHERE id = ?')
    .get(id) as { status: OrderStatus } | undefined

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Заказ не найден' })
  }

  if (existing.status === body.status) {
    // Ничего не изменилось — UPDATE пропускаем, email не отправляем.
    return { ok: true, status: body.status, email: null, noChange: true }
  }

  // 2. UPDATE статуса в БД.
  db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(
    body.status,
    Date.now(),
    id,
  )

  // 3. Опционально: email покупателю.
  const shouldSendEmail = body.sendEmail !== false
  let email: EmailResult | null = null

  if (shouldSendEmail) {
    email = await sendStatusEmail(id, body.status, body.message)
    mergeNotificationFailed(id, { email: email.ok })
  }

  return {
    ok: true,
    status: body.status,
    email,
  }
})

/**
 * Формирует и отправляет email покупателю о смене статуса.
 * Возвращает {ok, error?} — никогда не throw (не должен ломать успешный PATCH).
 */
async function sendStatusEmail(
  orderId: string,
  newStatus: OrderStatus,
  customMessage: string | undefined,
): Promise<EmailResult> {
  const row = getDb()
    .prepare('SELECT * FROM orders WHERE id = ?')
    .get(orderId) as Record<string, unknown> | undefined

  if (!row) {
    return { ok: false, error: 'Order disappeared after update' }
  }

  // Восстанавливаем OrderInBase для шаблона. Дубликат логики с notify-seller.post.ts
  // и orders.get.ts — нужен общий helper (W7 в review).
  const order: OrderInBase = {
    id: row.id as string,
    customer: {
      name: String(row.customer_name ?? ''),
      email: String(row.customer_email ?? ''),
      phone: (row.customer_phone as string | null) ?? '',
      userMessenger: (row.customer_messenger as string | null) ?? '',
      userNickname: (row.customer_nickname as string | null) ?? '',
      delivery: {
        type: ((row.delivery_type as string | null) ?? 'pickup') as
          | 'pickup'
          | 'delivery',
        city: (row.city as string | null) ?? '',
        recipient: (row.delivery_recipient as string | null) ?? '',
        address: (row.address as string | null) ?? '',
        street: (row.delivery_street as string | null) ?? '',
        house: (row.delivery_house as string | null) ?? '',
        apartment: (row.delivery_apartment as string | null) ?? '',
      },
    },
    purchase: {
      order: JSON.parse(
        (row.items_json as string) ?? '[]',
      ) as OrderInBase['purchase']['order'],
      createdAt: new Date(
        (row.created_at as number) ?? Date.now(),
      ).toISOString(),
    },
    totalPrice: Number(row.total ?? 0),
    status: row.status as OrderInBase['status'],
    statusLabel: STATUS_LABELS[newStatus],
    framing: (row.framing as 'none' | 'simple' | 'premium' | null) ?? undefined,
    paymentMethod:
      (row.payment_method as 'yookassa' | 'manual' | null) ?? 'manual',
    paymentId: (row.payment_id as string | null) ?? '',
    notificationFailed: null,
  }

  // Email-конфиг
  const cfg = getSmtpTransportConfig()
  if (!cfg) {
    return { ok: false, error: 'SMTP not configured' }
  }
  if (!order.customer.email) {
    return { ok: false, error: 'Customer email is empty' }
  }

  const payload = buildStatusEmailPayload(
    order,
    STATUS_LABELS[newStatus],
    customMessage,
  )
  const html = buildStatusEmailHtml(payload)
  return sendViaSmtp({
    to: payload.to,
    subject: `Обновление статуса заказа #${orderId}`,
    html,
  })
}

/**
 * Merge-обновление `notification_failed` в БД.
 * Сохраняет существующий telegram-статус (если был), перезаписывает email-статус.
 * Если результата нет (sendEmail=false) — не трогает БД.
 */
function mergeNotificationFailed(
  orderId: string,
  patch: { email: boolean },
): void {
  const row = getDb()
    .prepare('SELECT notification_failed FROM orders WHERE id = ?')
    .get(orderId) as { notification_failed: string | null } | undefined

  let merged: { telegram?: boolean; email: boolean } = { email: patch.email }
  if (row?.notification_failed) {
    try {
      const parsed = JSON.parse(row.notification_failed)
      if (typeof parsed === 'object' && parsed !== null) {
        merged = { ...parsed, email: patch.email }
      }
    } catch {
      // ignore — перезапишем
    }
  }

  getDb()
    .prepare('UPDATE orders SET notification_failed = ? WHERE id = ?')
    .run(JSON.stringify(merged), orderId)
}
