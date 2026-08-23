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

/* eslint-disable no-console */
export default defineEventHandler(async (event: H3Event): Promise<TelegramResponse> => {
  const body = await readBody<TelegramNotificationPayload>(event)
  if (!body?.orderId || !body?.orderData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'orderId and orderData required',
    })
  }

  const orderId = body.orderId
  const orderData = body.orderData
  const totalPrice = body.totalPrice

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

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