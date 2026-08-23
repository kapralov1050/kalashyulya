/* eslint-disable no-console */
import nodemailer from 'nodemailer'
import type { H3Event } from 'h3'
import { buildOrderEmail } from '../../utils/orderEmailTemplate'
import type { Order } from '~/types'

export interface SendEmailBody {
  to: string
  subject: string
  html: string
}

export interface SendEmailResult {
  ok: boolean
  error?: string
}

export function getSmtpTransportConfig() {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD
  if (!user || !pass) return null
  return {
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: { user, pass },
  }
}

async function sendViaSmtp(
  message: SendEmailBody,
): Promise<SendEmailResult> {
  const cfg = getSmtpTransportConfig()
  if (!cfg) {
    return { ok: false, error: 'SMTP not configured' }
  }
  // mail.ru требует MAIL FROM == authenticated user. SELLER_EMAIL убрали —
  // pin to auth.user чтобы не было соблазна рассинхронить.
  const transporter = nodemailer.createTransport(cfg)
  await transporter.sendMail({
    from: cfg.auth.user,
    to: message.to,
    subject: message.subject,
    html: message.html,
  })
  return { ok: true }
}

export default defineEventHandler(
  async (event: H3Event): Promise<SendEmailResult> => {
    const body = await readBody<SendEmailBody | { orderData: Order }>(event)
    if (!body) {
      throw createError({ statusCode: 400, statusMessage: 'Body required' })
    }

    let message: SendEmailBody
    if ('html' in body && body.html) {
      if (!body.to || !body.subject) {
        throw createError({
          statusCode: 400,
          statusMessage: 'to and subject required for pre-rendered email',
        })
      }
      message = { to: body.to, subject: body.subject, html: body.html }
    }
    else if ('orderData' in body) {
      message = buildOrderEmail(body.orderData)
    }
    else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Unsupported body',
      })
    }

    try {
      return await sendViaSmtp(message)
    } catch (error: unknown) {
      console.error('[email] send failed:', error)
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'unknown',
      }
    }
  },
)
