import type { Order } from '~/types'
import { escapeHtml } from './escapeHtml'

export interface OrderEmailRequest {
  to: string
  subject: string
  html: string
}

const framingLabels: Record<string, string> = {
  none: 'Без рамки',
  simple: 'Рама с паспарту',
  premium: 'Багет с паспарту',
}

const paymentLabels: Record<string, string> = {
  yookassa: 'Онлайн (ЮKassa)',
  manual: 'Перевод вручную',
}

export function buildOrderEmail(order: Order): OrderEmailRequest {
  const { customer, purchase, totalPrice, framing, paymentMethod } = order

  const adminEmail = process.env.EMAIL_USER
  if (!adminEmail) {
    throw new Error('EMAIL_USER is not configured')
  }

  const framingKey = framing ?? ''
  const framingText
    = (framingLabels[framingKey] ?? (framingKey ? escapeHtml(framingKey) : '')) || 'Не выбрано'
  const paymentKey = paymentMethod ?? ''
  const paymentText = paymentLabels[paymentKey] ?? 'Не указан'

  let deliveryHtml: string
  if (customer.delivery?.type === 'delivery') {
    const parts: string[] = []
    if (customer.delivery.city) parts.push(`<b>Город:</b> ${escapeHtml(customer.delivery.city)}`)
    if (customer.delivery.recipient) parts.push(`<b>Получатель:</b> ${escapeHtml(customer.delivery.recipient)}`)
    if (customer.delivery.address) parts.push(`<b>Адрес:</b> ${escapeHtml(customer.delivery.address)}`)
    deliveryHtml = parts.join('<br>') || 'Адрес не указан'
  }
  else {
    deliveryHtml = 'Самовывоз (Санкт-Петербург)'
  }

  const productsHtml = purchase.order
    .map(item => `
        <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(item.title)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${escapeHtml(String(item.amount))}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${escapeHtml(String(item.price))} ₽</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${escapeHtml(String(item.amount * item.price))} ₽</td>
        </tr>`)
    .join('')

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
        <h2 style="background:#06b6d4;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0;margin:0">📦 Новый заказ</h2>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px">
            <p style="margin:0 0 4px"><b>Дата:</b> ${escapeHtml(new Date(purchase.createdAt).toLocaleString('ru-RU'))}</p>
            <h3 style="margin:20px 0 8px;color:#374151">Покупатель</h3>
            <p style="margin:2px 0"><b>Имя:</b> ${escapeHtml(customer.name)}</p>
            <p style="margin:2px 0"><b>Email:</b> ${escapeHtml(customer.email)}</p>
            <p style="margin:2px 0"><b>Телефон:</b> ${escapeHtml(customer.phone || 'Не указан')}</p>
            <p style="margin:2px 0"><b>Связь:</b> ${escapeHtml(customer.userMessenger || 'Не указано')}${customer.userNickname ? ` · @${escapeHtml(customer.userNickname)}` : ''}</p>
            <h3 style="margin:20px 0 8px;color:#374151">Доставка</h3>
            <p style="margin:2px 0">${deliveryHtml}</p>
            <h3 style="margin:20px 0 8px;color:#374151">Оформление и оплата</h3>
            <p style="margin:2px 0"><b>Оформление:</b> ${escapeHtml(framingText)}</p>
            <p style="margin:2px 0"><b>Оплата:</b> ${escapeHtml(paymentText)}</p>
            <h3 style="margin:20px 0 8px;color:#374151">Товары</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
                <thead>
                    <tr style="background:#f9fafb;text-align:left">
                        <th style="padding:8px 12px">Название</th>
                        <th style="padding:8px 12px;text-align:center">Кол-во</th>
                        <th style="padding:8px 12px;text-align:right">Цена</th>
                        <th style="padding:8px 12px;text-align:right">Сумма</th>
                    </tr>
                </thead>
                <tbody>${productsHtml}</tbody>
            </table>
            <p style="margin:16px 0 0;font-size:18px;font-weight:bold;text-align:right;color:#06b6d4">Итого: ${escapeHtml(String(totalPrice))} ₽</p>
        </div>
    </div>`

  return {
    to: adminEmail,
    subject: `Новый заказ от ${customer.name}`,
    html,
  }
}
