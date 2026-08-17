import type { H3Event } from 'h3'
import {
  buildTelegramMessage,
  type TelegramNotificationPayload,
} from '../../utils/telegramMessage'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody<TelegramNotificationPayload>(event)
  if (!body?.orderId || !body?.orderData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'orderId and orderData required',
    })
  }

  const token = process.env.NUXT_TELEGRAM_BOT_TOKEN
  const chatId = process.env.NUXT_TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    return { ok: false, error: 'Telegram credentials not configured' }
  }

  const text = buildTelegramMessage(
    body.orderId,
    body.orderData,
    body.totalPrice,
  )

  try {
    await $fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          chat_id: chatId,
          text,
          parse_mode: 'MarkdownV2',
        },
      },
    )
    return { ok: true }
  } catch (error: unknown) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'unknown',
    }
  }
})
