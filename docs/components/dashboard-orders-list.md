# Список заказов админ-панели

Компонент для просмотра и управления заказами в админ-панели.

**Расположение**: [`/components/dashboard/OrdersList.vue`](../components/dashboard/OrdersList.vue)

**Store**: [`/stores/orders.ts`](../stores/orders.ts)

**Composable**: [`/composables/firebase/useFirebase.ts`](../composables/firebase/useFirebase.ts)

**Composable**: [`/composables/useOrderEmail.ts`](../composables/useOrderEmail.ts)

## Обзор

Компонент позволяет администратору:
1. Просматривать все заказы клиентов
2. Фильтровать заказы по статусу
3. Изменять статусы заказов
4. Просматривать информацию о клиентах
5. Просматривать детали доставки
6. Отправлять email уведомления клиентам

## Использование

```vue
<script setup lang="ts">
import OrdersList from '@/components/dashboard/OrdersList.vue'
</script>

<template>
  <OrdersList />
</template>
```

## Функционал

### 1. Просмотр заказов

- **Список заказов** с основной информацией
- Отображение:
  - Номер заказа
  - Дата создания
  - Общая сумма
  - Статус заказа
  - Информация о клиенте
  - Адрес доставки
  - Состав заказа

### 2. Фильтрация по статусу

Доступные статусы:
- `pending` — ожидает обработки
- `confirmed` — подтвержден
- `processing` — в обработке
- `shipped` — отправлен
- `delivered` — доставлен
- `cancelled` — отменен

### 3. Изменение статуса заказа

- **Select** для выбора нового статуса
- **Модальное окно** подтверждения изменения
- **Email уведомление** клиенту об изменении статуса
- **Pending состояние** — отслеживание несохраненных изменений

### 4. Информация о клиенте

- Имя клиента
- Телефон
- Email
- Мессенджер и никнейм (если указан)

### 5. Детали доставки

- Город
- Улица
- Номер дома
- Квартира (если указана)

## Структура данных

### OrderInBase

```typescript
interface OrderInBase {
  id: number                        // Уникальный ID заказа
  status: string                   // Текущий статус
  totalPrice: number               // Общая сумма

  purchase: {
    createdAt: string              // Дата создания (ISO)
    order: OrderItem[]             // Состав заказа
  }

  customer: {
    name: string                   // Имя клиента
    phone: string                  // Телефон
    email?: string                 // Email (опционально)
    userMessenger?: string         // Тип мессенджера
    userNickname?: string         // Никнейм в мессенджере
    delivery?: {
      city: string                 // Город
      street: string              // Улица
      house: string               // Номер дома
      apartment?: string          // Квартира (опционально)
    }
  }
}
```

### OrderItem

```typescript
interface OrderItem {
  id: number                      // ID товара
  title: string                  // Название
  price: number                   // Цена за единицу
  amount: number                  // Количество
}
```

## Компонент

### Props

Нет (использует глобальное состояние store).

### State

```typescript
interface State {
  selectedStatus: string           // Выбранный фильтр статуса
  isStatusModalOpen: boolean      // Открыто ли модальное окно
  selectedOrder: OrderInBase | null // Выбранный заказ для изменения
  pendingStatuses: Record<number, string>
  // Хранение pending статусов
  // orderId → новый статус
}
```

### Computed Properties

```typescript
// Отфильтрованные заказы по выбранному статусу
filteredOrders: OrderInBase[]

// Цвет границы карточки заказа по статусу
getStatusBorderClass(status: string): string

// Цвет фона для select статуса
getStatusBgClass(status: string): string
```

### Methods

```typescript
// Открытие модального окна подтверждения
openStatusModal(order: OrderInBase): void

// Обработка подтверждения изменения статуса
handleStatusConfirm(data: {
  orderId: number
  status: string
  message: string
}): Promise<void>

// Получение цвета по статусу
getStatusBorderClass(status: string): string
getStatusBgClass(status: string): string
```

## Store Integration

Использует `useOrdersStore()`:

```typescript
import { useOrdersStore } from '~/stores/orders'
const { allOrders } = storeToRefs(useOrdersStore())
```

## Firebase Integration

### Обновление статуса заказа

```typescript
const { updateOrderStatus } = useFirebase()

await updateOrderStatus(orderId, newStatus)
```

## Email Integration

Отправка уведомлений клиенту:

```typescript
const { sendStatusUpdateEmail } = useOrderEmail()

const emailResult = await sendStatusUpdateEmail(
  order,              // Данные заказа
  newStatus,          // Новый статус
  message             // Сообщение клиенту
)
```

Ответ:
```typescript
interface EmailResult {
  success: boolean
  error?: string
  message?: string
}
```

## Константы

### ORDER_STATUS_OPTIONS

```typescript
// /constants/orders.ts
export const ORDER_STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
]
```

### getOrderStatusColor

```typescript
// Возвращает цвет Tailwind для статуса
getOrderStatusColor(status: string): string

// Примеры:
// pending → 'yellow'
// confirmed → 'blue'
// delivered → 'green'
// cancelled → 'red'
```

## Поток изменения статуса

### Шаг 1: Выбор нового статуса
```
Выбрать статус в select →
pendingStatuses[orderId] = newStatus
→ Появляется кнопка "Обновить статус"
```

### Шаг 2: Открытие модального окна
```
Нажать "Обновить статус" →
Проверка: статус изменился? →
Да: открыть модальное окно →
Нет: показать предупреждение
```

### Шаг 3: Подтверждение изменения
```
В модальном окне:
1. Ввести сообщение клиенту (опционально)
2. Нажать "Подтвердить"

→ Обновить статус в Firebase
→ Отправить email уведомление
→ Обновить pendingStatuses
→ Показать уведомление об успехе/ошибке
```

## UI/UX

### Дизайн

- Карточки заказов в списке
- Цветовая кодировка по статусам (border слева)
- Grid layout для информации о клиенте и доставке
- Hover эффекты для карточек

### Цветовая кодировка

```typescript
// Цвета по статусам
pending: 'yellow'    // Ожидает
confirmed: 'blue'    // Подтвержден
processing: 'indigo' // В обработке
shipped: 'purple'    // Отправлен
delivered: 'green'   // Доставлен
cancelled: 'red'     // Отменен
```

### Карточка заказа

```
┌─────────────────────────────────────────────┐
│ Заказ #123                     15000 ₽     │
│ 28.02.2026                      [Статус]    │
│                                              │
│ Информация о клиенте    Адрес доставки     │
│ Имя: Иван Петров         Город: Москва    │
│ Телефон: +7...          Улица: Пушкина    │
│ Email: ivan@...         Дом: 10, кв. 5    │
│                                              │
│ Состав заказа:                               │
│ ┌───────────────────────────────────────┐   │
│ │ Картина "Пейзаж"     1 × 15000 ₽   │   │
│ └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Фильтрация

- Select для выбора статуса
- Опция "Все заказы" для просмотра всех
- Мгновенная фильтрация списка

## Примеры использования

### Изменение статуса заказа

```javascript
// 1. Выбрать новый статус
pendingStatuses.value[123] = 'shipped'

// 2. Открыть модальное окно
openStatusModal(order)

// 3. Подтвердить изменение
await handleStatusConfirm({
  orderId: 123,
  status: 'shipped',
  message: 'Ваш заказ отправлен! Ожидайте доставку.'
})
```

### Фильтрация заказов

```javascript
// Показать только доставленные заказы
selectedStatus.value = 'delivered'

// Показать все заказы
selectedStatus.value = 'all'
```

## Обработка ошибок

### При обновлении статуса

```typescript
try {
  // Обновление в Firebase
  await updateOrderStatus(data.orderId, data.status)

  // Отправка email
  const emailResult = await sendStatusUpdateEmail(
    order, data.status, data.message
  )

  if (emailResult.success) {
    toast.add({
      title: 'Успешно',
      description: `Статус заказа #${data.orderId} обновлен, уведомление отправлено`,
      color: 'success'
    })
  } else {
    toast.add({
      title: 'Предупреждение',
      description: `Статус обновлен, но email не отправлен: ${emailResult.error}`,
      color: 'warning'
    })
  }
} catch (error) {
  console.error('Error updating order status:', error)
  toast.add({
    title: 'Ошибка',
    description: 'Не удалось обновить статус заказа',
    color: 'error'
  })
}
```

## Email шаблоны

Email уведомление включает:
- Номер заказа
- Новый статус
- Сообщение администратора
- Информация о заказе (товары, сумма)
- Контактная информация

## Интеграция с админ-панелью

Компонент добавлен в [`/pages/admin/dashboard.vue`](../pages/admin/dashboard.vue):

```typescript
const dashboardModals: Record<DashBoardOption, Component> = {
  OrdersList: defineAsyncComponent(
    () => import('@/components/dashboard/OrdersList.vue'),
  ),
}
```

Доступен в селекторе модулей как "Заказы".

## Типы данных

```typescript
// /types/index.ts
export interface OrderInBase {
  id: number
  status: string
  totalPrice: number
  purchase: {
    createdAt: string
    order: OrderItem[]
  }
  customer: {
    name: string
    phone: string
    email?: string
    userMessenger?: string
    userNickname?: string
    delivery?: DeliveryInfo
  }
}

export interface OrderItem {
  id: number
  title: string
  price: number
  amount: number
}

export interface DeliveryInfo {
  city: string
  street: string
  house: string
  apartment?: string
}

export type DashBoardOption = 'OrdersList'
```

## Особенности

### Pending система

- Статусы сохраняются локально до подтверждения
- Кнопка "Обновить статус" только при изменении
- Предотвращает случайные изменения статуса

### Модальное окно подтверждения

- Требует подтверждения перед изменением статуса
- Позволяет добавить сообщение клиенту
- Показывает подробную информацию о заказе

### Email уведомления

- Автоматическая отправка при изменении статуса
- Кастомные сообщения от администратора
- Обработка ошибок отправки

### Реактивность

- Инициализация pending статусов при загрузке заказов
- Автоматическая подписка на изменения в store
- Мгновенное обновление UI

## Будущие улучшения

- [ ] Массовое изменение статусов
- [ ] Автоматическая генерация сообщений по шаблонам
- [ ] История изменения статусов
- [ ] Вложенные заказы (многоступенчатая доставка)
- [ ] Квитанции об оплате
- [ ] Экспорт заказов в Excel
- [ ] Статистика по статусам
- [ ] Возврат товаров
- [ ] Отслеживание трек-номера посылки
