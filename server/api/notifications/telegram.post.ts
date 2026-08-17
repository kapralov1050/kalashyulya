import type { H3Event } from 'h3'
import {
  buildTelegramMessage,
  type TelegramNotificationPayload,
} from '../../utils/telegramMessage'

interface TelegramResponse {
  success?: boolean
  message?: string
  error?: string
}

/**
 * POST /api/notifications/telegram — отправляет уведомление о заказе в Telegram.
 *
 * Phase D back-compat (после ревью): контракт возврата приведён к совместимости
 * с Yandex Cloud Function:
 *   - HTTP 500 + {success: false, error: '...'} при любых ошибках (креды, сеть, API 4xx/5xx)
 *   - HTTP 200 + {success: true, message: 'Notification sent successfully'} при успехе
 *
 * Партнёрский код (orders.post.ts) должен теперь проверять `success: true`,
 * а не полагаться на HTTP 2xx в целом — иначе failure поднимается как "ок".
 */
export default defineEventHandler(async (event: H3Event): Promise<TelegramResponse> => {
  const body = await readBody<TelegramNotificationPayload>(event)
  if (!body?.orderId || !body?.orderData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'orderId and orderData required',
    })
  }

  // Back-compat: принимаем также legacy-формат (полный Order без обёртки)
  // если кто-то решит вызвать напрямую со старым Yandex-совместимым payload.
  const orderId = body.orderId
  const orderData = body.orderData
  const totalPrice = body.totalPrice

  // Legacy env names: BOT_TOKEN/CHAT_ID (Yandex era) → fallback на новые NUXT_*.
  const token = process.env.BOT_TOKEN
    ?? process.env.NUXT_TELEGRAM_BOT_TOKEN
  const chatId = process.env.CHAT_ID
    ?? process.env.NUXT_TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.error('[telegram] credentials not configured')
    throw createError({
      statusCode: 500,
      statusMessage: 'Telegram credentials not configured',
    })
  }

  const text = buildTelegramMessage(orderId, orderData, totalPrice)

  try {
    const tgResponse = await $fetch<{ ok: boolean, result?: { message_id?: number } }>(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        },
      },
    )
    if (!tgResponse.ok) {
      console.error('[telegram] API returned ok=false:', JSON.stringify(tgResponse))
      throw createError({
        statusCode: 502,
        statusMessage: 'Telegram API error',
      })
    }
    return { success: true, message: 'Notification sent successfully' }
  }
  catch (error: unknown) {
    console.error('[telegram] sendMessage failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Telegram send failed',
    })
  }
})