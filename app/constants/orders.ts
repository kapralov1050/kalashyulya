/**
 * Константы статусов заказов
 */
export const OrderStatus = {
  NEW: 'Новый заказ',
  IN_PROGRESS: 'В работе',
  PAID: 'Оплачен',
  SHIPPED: 'Отправлен',
} as const

/**
 * Цветовые индикаторы для статусов заказов
 * Используются для Tailwind классов
 */
export const OrderStatusColors = {
  [OrderStatus.NEW]: 'blue',
  [OrderStatus.IN_PROGRESS]: 'yellow',
  [OrderStatus.PAID]: 'green',
  [OrderStatus.SHIPPED]: 'gray',
} as const

/**
 * Полные классы для бейджей статусов
 */
export const OrderStatusBadgeClasses = {
  [OrderStatus.NEW]: 'bg-blue-600/90 dark:bg-blue-500/90',
  [OrderStatus.IN_PROGRESS]: 'bg-yellow-600/90 dark:bg-yellow-500/90',
  [OrderStatus.PAID]: 'bg-green-600/90 dark:bg-green-500/90',
  [OrderStatus.SHIPPED]: 'bg-gray-600/90 dark:bg-gray-500/90',
} as const

/**
 * Список всех возможных статусов для выпадающих списков
 */
export const ORDER_STATUS_OPTIONS = Object.values(OrderStatus)

/**
 * Проверить валидность статуса заказа
 */
export function isValidOrderStatus(status: string): status is OrderStatusType {
  return ORDER_STATUS_OPTIONS.includes(status as OrderStatusType)
}

/**
 * Получить цвет для статуса заказа
 */
export function getOrderStatusColor(status: string): string {
  return OrderStatusColors[status as keyof typeof OrderStatusColors] || 'gray'
}

/**
 * Получить CSS классы для бейджа статуса
 */
export function getOrderStatusBadgeClasses(status: string): string {
  return OrderStatusBadgeClasses[status as keyof typeof OrderStatusBadgeClasses] || OrderStatusBadgeClasses[OrderStatus.SHIPPED]
}

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus]
