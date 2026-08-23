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

// Простая проверка email — не RFC-совместимая, но достаточная для защиты от
// очевидного мусора. Если из формы пришло что-то невалидное, лучше кинуть
// ошибку, чем отправить пустое письмо в никуда.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function buildOrderEmail(order: Order, orderId: string): OrderEmailRequest {
  const { customer, purchase, totalPrice, framing, paymentMethod } = order

  const customerEmail = customer.email?.trim()
  if (!customerEmail || !EMAIL_RE.test(customerEmail)) {
    throw new Error(`Invalid customer email: ${JSON.stringify(customer.email)}`)
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
        <h2 style="background:#06b6d4;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0;margin:0">Спасибо за заказ!</h2>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px">
            <p style="margin:0 0 16px">${escapeHtml(customer.name)}, здравствуйте!</p>
            <p style="margin:0 0 16px">Мы получили ваш заказ <b>#${escapeHtml(orderId)}</b> и скоро свяжемся с вами, чтобы подтвердить детали и согласовать оплату.</p>
            <h3 style="margin:20px 0 8px;color:#374151">Номер заказа</h3>
            <p style="margin:2px 0;font-size:18px;font-weight:bold;color:#06b6d4">#${escapeHtml(orderId)}</p>
            <h3 style="margin:20px 0 8px;color:#374151">Дата</h3>
            <p style="margin:2px 0">${escapeHtml(new Date(purchase.createdAt).toLocaleString('ru-RU'))}</p>
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
            <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:12px;color:#6b7280">Если у вас появятся вопросы — напишите мне в Telegram <a href="https://t.me/kalashyulya" style="color:#06b6d4">@kalashyulya</a> или ответьте на это письмо.</p>
            <p style="margin:8px 0 0;font-size:12px;color:#6b7280">Юлия Калашникова · kalashyulya.ru</p>
        </div>
    </div>`

  return {
    to: customerEmail,
    subject: `Заказ #${escapeHtml(orderId)} принят`,
    html,
  }
}