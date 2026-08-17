import type { Order } from '~/types'

export interface OrderEmailRequest {
  to: string
  subject: string
  html: string
}

/**
 * Строит email-уведомление о новом заказе для админа/покупателя.
 * Возвращает request-объект, который уходит в SMTP.
 */
export function buildOrderEmail(orderId: string, order: Order): OrderEmailRequest {
  const items = order.purchase.order
    .map(
      i =>
        `<tr><td>${escapeHtml(i.title)}</td><td>${i.amount}</td><td>${i.price} ₽</td><td>${i.amount * i.price} ₽</td></tr>`,
    )
    .join('')

  const deliveryLine = order.customer.delivery?.address
    ? `<p>Адрес: ${escapeHtml(order.customer.delivery.address)}</p>`
    : ''

  const html = `
    <h2>Новый заказ #${orderId}</h2>
    <p><b>Покупатель:</b> ${escapeHtml(order.customer.name)}</p>
    <p><b>Email:</b> ${escapeHtml(order.customer.email)}</p>
    ${order.customer.phone ? `<p><b>Телефон:</b> ${escapeHtml(order.customer.phone)}</p>` : ''}
    ${deliveryLine}
    <table border="1" cellpadding="6" style="border-collapse:collapse">
      <thead><tr><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead>
      <tbody>${items}</tbody>
      <tfoot><tr><td colspan="3"><b>Итого</b></td><td><b>${order.totalPrice} ₽</b></td></tr></tfoot>
    </table>
  `

  return {
    to: order.customer.email,
    subject: `Заказ #${orderId}`,
    html,
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, m => map[m] ?? m)
}
