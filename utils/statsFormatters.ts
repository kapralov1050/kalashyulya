const EVENT_NAME_MAP: Record<string, string> = {
  calendar: 'Переходов на страницу календарей',
  shop: 'Переходов в магазин',
  productExtendedButton: 'Открывал карточку товара',
  startOrderButton: 'Начинал оформление заказа',
  completeOrderButton: 'Закончил оформление заказа',
  vkButton: 'Переходы во Вконтакте',
  telegramButton: 'Переходы в Телеграм',
}

/**
 * Форматирует название события для отображения в UI
 * @param eventType - ключ события в формате 'type_action_name'
 * @returns отформатированное название события
 */
export function formatEventName(eventType: string): string {
  const [_entity, _action, ...nameParts] = eventType.split('_')
  const name = nameParts.join('_')

  return (
    EVENT_NAME_MAP[name] ||
    eventType
      .replace('page_view_', 'Просмотр: ')
      .replace('button_click_', 'Клик: ')
      .replace(/_/g, ' ')
  )
}

/**
 * Форматирует дату в локализованный формат
 * @param dateString - строка даты в формате YYYY-MM-DD
 * @returns отформатированная дата
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Форматирует timestamp в строку времени последнего обновления
 * @param timestamp - ISO строка timestamp
 * @returns строка времени в формате 'обновлено: HH:MM'
 */
export function formatLastUpdated(timestamp: string): string {
  const date = new Date(timestamp)
  return `обновлено: ${date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

/**
 * Возвращает название месяца по его номеру
 * @param monthNumber - номер месяца (1-12)
 * @returns название месяца на русском
 */
export function getMonthName(monthNumber: string): string {
  const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ]
  return months[parseInt(monthNumber) - 1] || monthNumber
}
