import type { Order } from '~/types'

export interface TelegramNotificationPayload {
  orderId: string
  orderData: Order
  totalPrice: number
}

/**
 * Строит текст сообщения для Telegram по заказу.
 * Вынесено в отдельную функцию, чтобы покрыть unit-тестами.
 */
export function buildTelegramMessage(
  orderId: string,
  order: Order,
  totalPrice: number,
): string {
  const items = order.purchase.order
    .map(
      i => `• ${escapeMd(i.title)} — ${i.amount} шт. × ${i.price} ₽`,
    )
    .join('\n')

  const customerLines: string[] = [
    `👤 Имя: ${escapeMd(order.customer.name)}`,
  ]
  if (order.customer.phone) {
    customerLines.push(`📞 Телефон: ${escapeMd(order.customer.phone)}`)
  }
  customerLines.push(`✉️ Email: ${escapeMd(order.customer.email)}`)
  if (order.customer.userMessenger) {
    customerLines.push(`💬 Связь: ${escapeMd(order.customer.userMessenger)}`)
  }
  if (order.customer.userNickname) {
    customerLines.push(`🔗 Ник: ${escapeMd(order.customer.userNickname)}`)
  }
  if (order.customer.delivery?.city) {
    customerLines.push(`� Город: ${escapeMd(order.customer.delivery.city)}`)
  }
  if (order.customer.delivery?.address) {
    customerLines.push(
      `📍 Адрес: ${escapeMd(order.customer.delivery.address)}`,
    )
  }

  return [
    `🛒 *Новый заказ #${orderId}*`,
    '',
    '*Покупатель:*',
    customerLines.join('\n'),
    '',
    '*Состав заказа:*',
    items,
    '',
    `💰 *Итого: ${totalPrice} ₽*`,
    `🕒 ${escapeMd(new Date(order.purchase.createdAt).toLocaleString('ru-RU'))}`,
  ].join('\n')
}

function escapeMd(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1')
}
