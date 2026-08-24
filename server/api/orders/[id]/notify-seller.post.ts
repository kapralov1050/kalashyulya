/**
 * POST /api/orders/:id/notify-seller — отправляет уведомления продавцу
 * (email покупателю + Telegram продавцу) с актуальным payment_method из БД.
 *
 * Используется из /shop/payment-success при:
 *  - polling тик → ЮKassa вернула 'succeeded' (онлайн-оплата прошла).
 *  - immediate succeeded (пользователь сразу оплатил в виджете, polling не запускается).
 *  - после успешного switchToManual (пользователь переключил с yookassa
 *    на ручную оплату).
 *
 * В orders.post.ts этот endpoint НЕ вызывается: для случая, когда
 * покупатель СРАЗУ выбрал ручную оплату, email+Telegram уходят там же
 * (paymentMethod='manual' финальный сразу).
 *
 * Идемпотентность: если оба канала уже отправлены успешно (notification_failed
 * содержит { telegram: true, email: true }), endpoint возвращает skipped=true
 * БЕЗ новых отправок. Это защищает от двойных вызовов при refresh страницы
 * /shop/payment-success и от race conditions.
 *
 * Гарантия: суммарно по заказу продавцу уходит РОВНО ОДНО Telegram-сообщение
 * и РОВНО ОДИН email (для случая yookassa). Для manual — оба уходят в orders.post.
 */
/* eslint-disable no-console */
import { $fetch } from 'ofetch'
import type { Order } from '~/types'
import { getDb } from '../../../utils/db'
import { getRequestURL } from 'h3'

interface OrderRow {
  id: string
  total: number
  payment_method: 'yookassa' | 'manual' | null
  status: 'new' | 'paid' | 'shipped' | 'cancelled'
  notification_failed: string | null
}

interface ChannelResult {
  ok: boolean
  skipped?: boolean
  error?: string
}

interface NotifySellerResult {
  ok: boolean
  skipped?: boolean
  paymentMethod?: 'yookassa' | 'manual'
  email: ChannelResult
  telegram: ChannelResult
}

function parseNotif(raw: string | null): { telegram?: boolean, email?: boolean } | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as { telegram?: boolean, email?: boolean }
    }
  } catch {
    // ignore
  }
  return null
}

function loadOrder(id: string): { order: Order, total: number, paymentMethod: 'yookassa' | 'manual', status: OrderRow['status'], existingNotif: { telegram?: boolean, email?: boolean } | null } | null {
  const row = getDb()
    .prepare('SELECT * FROM orders WHERE id = ?')
    .get(id) as Record<string, unknown> | undefined

  if (!row) return null

  return {
    order: {
      customer: {
        name: String(row.customer_name ?? ''),
        email: String(row.customer_email ?? ''),
        phone: (row.customer_phone as string | null) ?? '',
        userMessenger: (row.customer_messenger as string | null) ?? '',
        userNickname: (row.customer_nickname as string | null) ?? '',
        delivery: {
          type: ((row.delivery_type as string | null) ?? 'pickup') as 'pickup' | 'delivery',
          city: (row.city as string | null) ?? '',
          recipient: (row.delivery_recipient as string | null) ?? '',
          address: (row.address as string | null) ?? '',
          street: (row.delivery_street as string | null) ?? '',
          house: (row.delivery_house as string | null) ?? '',
          apartment: (row.delivery_apartment as string | null) ?? '',
        },
      },
      purchase: {
        order: JSON.parse((row.items_json as string) ?? '[]') as Order['purchase']['order'],
        createdAt: new Date((row.created_at as number) ?? Date.now()).toISOString(),
      },
      totalPrice: Number(row.total ?? 0),
      framing: (row.framing as 'none' | 'simple' | 'premium' | null) ?? undefined,
      paymentMethod: (row.payment_method as 'yookassa' | 'manual' | null) ?? 'manual',
    },
    total: Number(row.total ?? 0),
    paymentMethod: (row.payment_method as 'yookassa' | 'manual' | null) ?? 'manual',
    status: (row.status as OrderRow['status']) ?? 'new',
    existingNotif: parseNotif((row.notification_failed as string | null) ?? null),
  }
}

// 5 секунд — Telegram/email-уведомления должны уйти быстро (нормально <2 сек),
// но даём запас на холодный старт nodemailer + Telegram API.
const FETCH_TIMEOUT_MS = 5_000

async function sendEmail(origin: string, orderId: string, order: Order): Promise<ChannelResult> {
  try {
    const r = await $fetch<{ ok: boolean, error?: string }>('/api/notifications/email', {
      method: 'POST',
      baseURL: origin,
      body: { orderId, orderData: order },
      ignoreResponseError: true,
      timeout: FETCH_TIMEOUT_MS,
    })
    return { ok: r.ok === true, error: r.ok === true ? undefined : r.error }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' }
  }
}

async function sendTelegram(origin: string, orderId: string, order: Order, totalPrice: number): Promise<ChannelResult> {
  try {
    const r = await $fetch<{ success: boolean }>('/api/notifications/telegram', {
      method: 'POST',
      baseURL: origin,
      body: { orderId, orderData: order, totalPrice },
      ignoreResponseError: true,
      timeout: FETCH_TIMEOUT_MS,
    })
    return { ok: r.success === true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' }
  }
}

export default defineEventHandler(
  async (event): Promise<NotifySellerResult> => {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'id обязателен' })
    }

    const loaded = loadOrder(id)
    if (!loaded) {
      throw createError({ statusCode: 404, statusMessage: 'Заказ не найден' })
    }

    const { order, total, paymentMethod, existingNotif } = loaded
    const origin = getRequestURL(event).origin

    // Идемпотентность: если оба канала уже отправлены — пропускаем.
    const telegramAlreadySent = existingNotif?.telegram === true
    const emailAlreadySent = existingNotif?.email === true

    if (telegramAlreadySent && emailAlreadySent) {
      console.log(`[notify-seller] id=${id} skipped (already sent)`)
      return {
        ok: true,
        skipped: true,
        paymentMethod,
        email: { ok: true, skipped: true },
        telegram: { ok: true, skipped: true },
      }
    }

    // Отправляем только недостающие каналы параллельно.
    const [emailRes, telegramRes] = await Promise.all([
      emailAlreadySent
        ? Promise.resolve<ChannelResult>({ ok: true, skipped: true })
        : sendEmail(origin, id, order),
      telegramAlreadySent
        ? Promise.resolve<ChannelResult>({ ok: true, skipped: true })
        : sendTelegram(origin, id, order, total),
    ])

    // Записываем результат в БД (merge с существующим notification_failed).
    // Это нужно для админки: оператор видит реальный статус уведомлений
    // (включая случай «оба канала упали»).
    const merged = {
      telegram: telegramRes.ok || telegramAlreadySent,
      email: emailRes.ok || emailAlreadySent,
    }
    getDb()
      .prepare('UPDATE orders SET notification_failed = ? WHERE id = ?')
      .run(JSON.stringify(merged), id)

    if (merged.telegram && merged.email) {
      console.log(`[notify-seller] id=${id} payment=${paymentMethod} email=ok telegram=ok`)
    } else {
      console.warn(
        `[notify-seller] id=${id} payment=${paymentMethod} email=${emailRes.ok ? 'ok' : `fail(${emailRes.error ?? 'unknown'})`} telegram=${telegramRes.ok ? 'ok' : `fail(${telegramRes.error ?? 'unknown'})`}`,
      )
    }

    return {
      ok: emailRes.ok || telegramRes.ok, // хотя бы один дошёл
      paymentMethod,
      email: emailRes,
      telegram: telegramRes,
    }
  },
)