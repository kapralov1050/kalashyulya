const EVENT_NAME_MAP: Record<string, string> = {
  // Страницы — старый формат (обратная совместимость)
  calendar: 'Календарь (старое)',
  shop: 'Магазин (старое)',

  // Страницы — новый формат (route.path)
  '/': 'Главная',
  '/shop': 'Магазин',
  '/basket': 'Корзина',
  '/calendar': 'Календарь',
  '/requisites': 'Реквизиты',
  '/exhibitions': 'Выставки',
  '/shop/payment': 'Страница оплаты',
  '/shop/payment-success': 'Успешная оплата',

  // Кнопки — общие
  buyButton: 'Нажал «Купить»',
  addToBasket: 'Добавил в корзину',
  productExtendedButton: 'Открыл карточку товара',
  startOrderButton: 'Начал оформление заказа',
  completeOrderButton: 'Отправил форму заказа',
  vkButton: 'Перешёл во ВКонтакте',
  telegramButton: 'Перешёл в Телеграм',
  requisitesButton: 'Открыл реквизиты',
  trackingButton: 'Открыл отслеживание',

  // Кнопки — воронка покупки
  paymentMethod_yookassa: 'Выбрал онлайн оплату',
  paymentMethod_manual: 'Выбрал перевод вручную',
  stockCheckFailed: 'Товар недоступен при заказе',
  orderSuccess: 'Заказ успешно оформлен',
  orderError: 'Ошибка оформления заказа',
  paymentRedirect: 'Перешёл на ЮKassa',
  paymentSuccess: 'Оплата подтверждена',
  checkoutStarted: 'Начал заполнять форму заказа',
  paymentCreateError: 'Ошибка создания платежа ЮKassa',

  // Источники перехода (referrer)
  direct: 'Прямой переход',
  vk: 'ВКонтакте',
  telegram: 'Телеграм',
  google: 'Google',
  yandex: 'Яндекс',
  instagram: 'Instagram',
  other: 'Другой источник',

  // Тип устройства (device)
  mobile: 'Мобильное',
  desktop: 'Десктоп',
  tablet: 'Планшет',

  // Возвращаемость (visitor)
  new: 'Новый посетитель',
  returning: 'Вернувшийся посетитель',
}

const KNOWN_PREFIXES = [
  'page_view_',
  'button_click_',
  'referrer_',
  'device_',
  'visitor_',
  'time_',
] as const

export function formatEventName(input: string): string {
  // Direct lookup (pure name: '/shop', 'addToBasket', 'mobile')
  if (EVENT_NAME_MAP[input]) return EVENT_NAME_MAP[input]

  // Strip known prefix and look up pure name
  for (const prefix of KNOWN_PREFIXES) {
    if (input.startsWith(prefix)) {
      const name = input.slice(prefix.length)
      if (EVENT_NAME_MAP[name]) return EVENT_NAME_MAP[name]
    }
  }

  // Fallback: human-readable string
  return input
    .replace(/^page_view_/, 'Просмотр: ')
    .replace(/^button_click_/, 'Клик: ')
    .replace(/^referrer_/, 'Источник: ')
    .replace(/^device_/, 'Устройство: ')
    .replace(/^visitor_/, 'Посетитель: ')
    .replace(/^time_/, 'Время на: ')
    .replace(/_/g, ' ')
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatLastUpdated(timestamp: string): string {
  const date = new Date(timestamp)
  return `обновлено: ${date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

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
