import type { OrderInBase } from '~/types'

export interface StatusEmailRequest {
  to: string
  subject: string
  html: string
}

export interface StatusEmailPayload {
  to: string
  customerName: string
  orderId: number | string
  orderItems: {
    title: string
    amount: number
    price: number
    total: number
  }[]
  totalPrice: number
  newStatus: string
  customMessage?: string
}

/**
 * Строит HTML-шаблон email-уведомления о смене статуса заказа.
 * Совместим с тем, что раньше отправлялся cloud function.
 */
export function buildStatusEmailHtml(
  data: StatusEmailPayload,
): string {
  const items = data.orderItems
    .map(
      item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px;">${escapeHtml(item.title)}</td>
      <td style="padding: 12px 8px; text-align: center;">${item.amount} шт.</td>
      <td style="padding: 12px 8px; text-align: right;">${item.price} ₽</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 600;">${item.total} ₽</td>
    </tr>`,
    )
    .join('')

  const customBlock = data.customMessage
    ? `
    <div style="background-color: #f9fafb; padding: 16px; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0; white-space: pre-wrap; color: #374151; line-height: 1.5;">${escapeHtml(data.customMessage)}</p>
    </div>`
    : ''

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Обновление статуса заказа #${data.orderId}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; margin: 0; padding: 40px 20px; background-color: #ffffff; color: #111827;">
  <div style="max-width: 500px; margin: 0 auto;">
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">
      ${escapeHtml(data.customerName)}, здравствуйте!
    </p>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151;">
      Ваш заказ #${data.orderId} изменен на статус:
    </p>
    <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 14px 20px; margin-bottom: 32px; text-align: center;">
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #059669;">${escapeHtml(data.newStatus)}</p>
    </div>
    <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 500; color: #111827;">Состав заказа:</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
      <tbody>${items}</tbody>
      <tfoot>
        <tr style="border-top: 2px solid #e5e7eb;">
          <td colspan="3" style="padding: 16px 8px 8px 0; text-align: right; font-size: 15px; color: #374151;">Итого</td>
          <td style="padding: 16px 0 8px 0; text-align: right; font-size: 16px; font-weight: 600; color: #111827;">${data.totalPrice} ₽</td>
        </tr>
      </tfoot>
    </table>
    ${customBlock}
    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 4px 0; font-size: 14px; color: #111827;">Юлия Калашникова</p>
      <p style="margin: 0; font-size: 13px; color: #9ca3af;">@kalashyulya</p>
    </div>
    <p style="margin: 32px 0 0 0; font-size: 12px; color: #9ca3af;">
      Это автоматическое уведомление. Пожалуйста, не отвечайте на это письмо.
    </p>
  </div>
</body>
</html>`
}

export function buildStatusEmailPayload(
  order: OrderInBase,
  newStatus: string,
  customMessage?: string,
): StatusEmailPayload {
  return {
    to: order.customer.email,
    customerName: order.customer.name || 'Уважаемый клиент',
    orderId: order.id,
    orderItems: order.purchase.order.map(item => ({
      title: item.title,
      amount: item.amount,
      price: item.price,
      total: item.amount * item.price,
    })),
    totalPrice: order.totalPrice,
    newStatus,
    customMessage,
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
