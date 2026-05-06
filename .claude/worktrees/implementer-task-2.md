# Implementer Subagent - Task 2: Создать страницу отслеживания заказа OrderTracking.vue

## Задача
Создать страницу `/shop/tracking` которая позволяет искать заказы по ID платежа.

## Технологии
- Nuxt 3
- Vue 3
- TypeScript
- Firebase Realtime Database
- SCSS

## Требования к реализации

### Функциональные требования
1. Поле ввода для ID платежа с плейсхолдером
2. Кнопка "Найти заказ" (disabled при пустом вводе)
3. Поиск заказа в Firebase по `paymentId` (как в PaymentSuccess.vue)
4. Отображение карточки заказа с деталями:
   - Номер заказа (id)
   - Товар (order.purchase.order[0].title)
   - Цена (order.totalPrice)
   - Статус с цветной индикацией (Оплачен - зеленый, Отменен - красный)
   - Дата заказа (formatDate)
   - Способ доставки (getDeliveryMethod)
5. Отображение информации о клиенте:
   - Имя (order.customer.name)
   - Email (order.customer.email)
   - Телефон (order.customer.phone || 'Не указан')
   - Способ связи (order.customer.userMessenger || 'Не указан')
6. Обработка ошибок:
   - Пустой ввод ID: "Введите ID платежа для поиска заказа."
   - Заказ не найден: "Заказ с таким ID не найден. Проверьте введенный ID или свяжитесь с поддержкой."
   - Ошибка Firebase: "Не удалось выполнить поиск. Попробуйте позже."
7. Кнопка "Попробовать снова" при ошибке
8. Состояния: loading (спиннер), error (ошибка), order (успешный поиск)

### UI/UX требования
1. Форма поиска по центру страницы
2. Карточка заказа с белым фоном и тенью
3. Адаптивность для мобильных устройств
4. Цветовая индикация статусов заказа
5. Поддержка темной темы
6. Чистый и понятный интерфейс

### Технические требования
1. Поиск заказа по `paymentId` (как в PaymentSuccess)
2. Хелпер функции: `formatDate`, `getDeliveryMethod`, `getStatusClass`
3. Валидация перед поиском (проверка на пустой ввод)
4. Очистка поиска при reset
5. Правильная типизация данных

## Дополнительный контекст

### Цветовая схема статусов
```css
.status-paid { color: #10b981; }      // Оплачен
.status-processing { color: #f59e0b; } // В обработке
.status-canceled { color: #ef4444; }  // Отменен
.status-new { color: #6b7280; }         // Новый заказ
```

### Хелпер функции
```typescript
const formatOrderDate = (date: string) => {
  return new Date(date).toLocaleString('ru-RU')
}

const getDeliveryMethod = (delivery: any) => {
  if (delivery?.street || delivery?.city) {
    return 'Доставка'
  }
  return 'Самовывоз'
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Оплачен': return 'status-paid'
    case 'В обработке': return 'status-processing'
    case 'Отменен': return 'status-canceled'
    case 'Новый заказ': return 'status-new'
    default: return ''
  }
}
```

## Тестирование

1. Создать тестовый заказ в Firebase с `paymentId`
2. Перейти по URL: `http://localhost:3000/shop/tracking`
3. Ввести правильный `paymentId` → заказ найден и отображается
4. Ввести неверный `paymentId` → сообщение об ошибке
5. Проверить пустой ввод → валидация срабатывает

## Коммит

```bash
git add pages/shop/tracking.vue
git commit -m "feat: add order tracking page"
```

## Вопросы к разработчику

Если есть вопросы во время реализации:
1. Какое максимальное количество попыток поиска?
2. Нужно ли добавить CAPTCHA или rate limiting?
3. Нужно ли показывать историю всех заказов если есть аутентификация?
4. Какой формат даты предпочитаете?

Начни реализацию! После завершения сообщи что готово.