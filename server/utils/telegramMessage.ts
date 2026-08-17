import type { Order } from '~/types'

export interface TelegramNotificationPayload {
  orderId: string
  orderData: Order
  totalPrice: number
}

/**
 * Строит HTML-сообщение для Telegram по заказу, точно повторяя Yandex-функцию:
 * 📦 НОВЫЙ ЗАКАЗ!
 * ⏰ Дата / 👤 Клиент / 📧 Email / 📞 Телефон / 💬 Связь · @ник
 * 🚚 Доставка (тип/delivery)
 * 🖼 Оформление (framing)
 * 💳 Оплата (paymentMethod)
 * 🛒 Товары
 * 💵 Итого
 *
 * Phase D back-compat (после ревью):
 * - parse_mode: 'HTML' (как в Yandex) → нет риска дефиса/id/-в-boldMarkdownV2
 * - Возвращены поля framing / paymentMethod / delivery.type / recipient
 * - Экранирование только для HTML-чувствительных символов (<, >, &)
 */

const FRAMING_LABELS: Record<string, string> = {
  none: 'Без рамки',
  simple: 'Рама с паспарту',
  premium: 'Багет с паспарту',
}

function paymentLabel(method: string | undefined): string {
  if (method === 'yookassa') return 'Онлайн (ЮKassa)'
  if (method === 'manual') return 'Перевод вручную'
  return 'Не указан'
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function buildTelegramMessage(
  orderId: string,
  order: Order,
  totalPrice: number,
): string {
  const items = order.purchase.order
    .map(i => `  • ${escapeHtml(i.title)} × ${i.amount} шт. — ${i.price} ₽`)
    .join('\n')

  // Доставка: различаем pickup и delivery (как в Yandex).
  let deliveryText: string
  if (order.customer.delivery?.type === 'delivery') {
    const parts: string[] = []
    if (order.customer.delivery.city) parts.push(`Город: ${escapeHtml(order.customer.delivery.city)}`)
    if (order.customer.delivery.recipient) parts.push(`Получатель: ${escapeHtml(order.customer.delivery.recipient)}`)
    if (order.customer.delivery.address) parts.push(`Адрес: ${escapeHtml(order.customer.delivery.address)}`)
    deliveryText = parts.length ? parts.join('\n') : 'Адрес не указан'
  }
  else {
    deliveryText = 'Самовывоз (Санкт-Петербург)'
  }

  // Оформление рамкой.
  const framingKey = (order as Order & { framing?: string }).framing
  const framingText = framingKey && FRAMING_LABELS[framingKey]
    ? FRAMING_LABELS[framingKey]!
    : 'Не выбрано'

  // Способ оплаты.
  const paymentKey = (order as Order & { paymentMethod?: string }).paymentMethod
  const paymentText = paymentLabel(paymentKey)

  return (
    `📦 <b>НОВЫЙ ЗАКАЗ!</b>\n\n` +
    `⏰ <b>Дата:</b> ${escapeHtml(new Date(order.purchase.createdAt).toLocaleString('ru-RU'))}\n` +
    `👤 <b>Клиент:</b> ${escapeHtml(order.customer.name)}\n` +
    `📧 <b>Email:</b> ${escapeHtml(order.customer.email)}\n` +
    `📞 <b>Телефон:</b> ${escapeHtml(order.customer.phone || 'Не указан')}\n` +
    `💬 <b>Связь:</b> ${escapeHtml(order.customer.userMessenger || 'Не указано')}` +
    (order.customer.userNickname ? ` · @${escapeHtml(order.customer.userNickname)}` : '') +
    `\n\n` +
    `🚚 <b>Доставка:</b>\n${deliveryText}\n\n` +
    `🖼 <b>Оформление:</b> ${escapeHtml(framingText)}\n` +
    `💳 <b>Оплата:</b> ${escapeHtml(paymentText)}\n\n` +
    `🛒 <b>Товары:</b>\n${items}\n\n` +
    `💵 <b>Итого: ${totalPrice} ₽</b>`
  )
}