# PaymentSuccess Component

## Описание
Компонент страницы успешной оплаты, которая отображает информацию об успешной оплате заказа через ЮKassa.

## Путь
`pages/shop/payment-success.vue`

## Props
Нет (использует route query параметры)

## Состояния (State)
- **loading** - загрузка данных заказа из Firebase
- **error** - ошибка при получении данных
- **order** - данные заказа загружены

## События (Events)
Нет (нет событий для родительских компонентов)

## Функционал
Компонент получает `paymentId` из route query параметров, ищет соответствующий заказ в Firebase и отображает детальную информацию об оплате.

### Основные функции:
1. **Получение параметров:**
   - Извлекает `paymentId` из `route.query.paymentId`
   - Проверяет наличие `paymentId`

2. **Поиск заказа в Firebase:**
   - Ищет заказ по `paymentId` используя `db.ref('orders').orderByChild('paymentId').equalTo(paymentId).once('value')`
   - Валидирует наличие `paymentId` перед запросом

3. **Отображение деталей заказа:**
   - Название товара (order.purchase.order[0].title)
   - Цена заказа (order.totalPrice)
   - Способ доставки (delivery.street ? 'Доставка' : 'Самовывоз')
   - Дата оплаты (order.purchase.createdAt)

4. **Отображение номера для отслеживания:**
   - ID платежа (paymentId)
   - Предупреждение: "Сохраните этот номер для отслеживания заказа"

5. **Информация о следующих шагах:**
   - Скоро свяжется продавец
   - Отслеживание на странице отслеживания заказа
   - Связь через указанный контакт

6. **Контактная информация:**
   - Telegram: @kalashyulyaa

7. **Обработка ошибок:**
   - Заказ не найден
   - Отсутствует paymentId
   - Ошибка Firebase

8. **Состояния загрузки и ошибки:**
   - Spiner загрузки при получении данных
   - Карточка ошибки с кнопкой "Вернуться в магазин"

## Данные (Data)
Компонент работает со следующей структурой данных в Firebase:

```typescript
interface Order {
  id: number
  status: string
  paymentId: string
  customer: {
    name: string
    email: string
    phone?: string
    userMessenger?: string
    delivery?: {
      recipient?: string
      street?: string
      city?: string
      house?: string
      apartment?: string
    }
  }
  purchase: {
    order: Array<{
      title: string
      price: number
      amount: number
    }>
    createdAt: string
  }
  totalPrice: number
}
```

## Зависимости (Dependencies)
- `composables/useFirebaseDatabase` - для доступа к Firebase
- `components/shop/AnimatedBlob.vue` - компонент галочки
- `components/app/header/Header.vue` - для навигации

## Интеграция с Firebase
Компонент использует Firebase Realtime Database для поиска заказов по `paymentId`.

### Query Pattern
```javascript
db.ref('orders').orderByChild('paymentId').equalTo(paymentId).once('value')
```

### Путь в Firebase
- `orders` - корневой путь коллекции заказов
- Поиск по дочернему полю `paymentId` в каждом объекте заказа

## UI/UX
- Использует компонент AnimatedBlob для визуального успеха (галочка)
- Градиентный фон страницы
- Белые карточки с тенью на сером фоне
- Адаптивный дизайн для мобильных устройств
- Поддержка темной темы (dark mode)

## Особенности реализации
- **Безопасность:** Все данные из Firebase безопасно отображаются через Vue template
- **Производительность:** Одиночный запрос к Firebase при монтировании
- **Доступность:** Читаемый и понятный интерфейс на русском языке
- **Обработка ошибок:** Комплексная система обработки ошибок с дружественными сообщениями

## Примеры использования

### Успешный сценарий
```
URL: /shop/payment-success?paymentId=314c92fb-000f-5000-b000-1c4140d12338
Отображение:
- Галочка успеха
- Детали заказа (товар, цена, доставка)
- Номер для отслеживания (ID платежа)
- Предупреждение о сохранении номера
- Следующие шаги
- Контакт Telegram
- Кнопки действий
```

### Сценарий с ошибкой
```
URL: /shop/payment-success?paymentId=invalid_id
Отображение:
- Карточка ошибки
- Сообщение: "Заказ не найден. Проверьте ID платежа или свяжитесь с поддержкой."
- Кнопка "Вернуться в магазин"
```

## Развертывание
Компонент автоматически развертывается Nuxt на маршруте `/shop/payment-success`.

## Логирование
Все ошибки логируются в console для отладки.

## Локализация
Все текстовые сообщения на русском языке. При необходимости можно добавить поддержку мультиязычности.
