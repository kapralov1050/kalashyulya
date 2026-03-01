# Список товаров админ-панели

Компонент для просмотра и управления товарами магазина в админ-панели.

**Расположение**: [`/components/dashboard/ProductsList.vue`](../components/dashboard/ProductsList.vue)

**Store**: [`/stores/shop.ts`](../stores/shop.ts)

## Обзор

Компонент позволяет администратору:
1. Просматривать все товары магазина
2. Управлять статусом брони товаров
3. Удалять товары из каталога
4. Отслеживать количество товаров на складе

## Использование

```vue
<script setup lang="ts">
import ProductsList from '@/components/dashboard/ProductsList.vue'
</script>

<template>
  <ProductsList />
</template>
```

## Функционал

### 1. Просмотр товаров

- **Список товаров** с основными параметрами
- Отображение:
  - Название товара
  - Количество на складе
  - Цена
  - Статус брони

### 2. Управление бронью

- **Toggle переключатель** для изменения статуса брони
- **Pending состояние** — изменения сохраняются локально
- **Кнопка подтверждения** — сохранение в Firebase
- Индикаторы состояния:
  - "Доступен" — товар доступен для продажи
  - "Забронирован" — товар забронирован
  - "В брони" — ожидает подтверждения

### 3. Удаление товаров

- **Кнопка удаления** с подтверждением
- **Защита от удаления последнего товара**
- Удаление файлов из Yandex Storage
- Удаление записи из Firebase

## Структура данных

### Product

```typescript
interface Product {
  id: number              // Уникальный идентификатор
  title: string           // Название товара
  stock: number           // Количество на складе
  price: number           // Цена
  isReserved?: boolean    // Статус брони
  image?: string[]        // URL изображений
  file?: string[]         // Имена файлов
  categoryId: string      // Категория
  // ... остальные поля
}
```

## Компонент

### Props

Нет (использует глобальное состояние store).

### State

```typescript
interface State {
  pendingReservations: Record<number, boolean | undefined>
  // Хранение pending изменений статуса брони
  // productId → новое значение isReserved
}
```

### Computed Properties

```typescript
// Текущий статус брони (с учетом pending изменений)
getReservationStatus(productId: number): boolean

// Есть ли pending изменения
hasPendingChange(productId: number): boolean

// Текстовое представление статуса
getReservationLabel(productId: number): string
```

### Methods

```typescript
// Переключение статуса брони (local)
toggleReservation(productId: number): void

// Подтверждение изменений (save to Firebase)
confirmReservation(productId: number): Promise<void>

// Удаление товара
removeProduct(productid: number): Promise<void>
```

## Store Integration

Использует `useShopStore()`:

```typescript
import { useShopStore } from '~/stores/shop'

const shopStore = useShopStore()

// Все товары
shopStore.allProducts: Product[]

// Получение имен файлов товара
shopStore.getProductFileName(productId: number): string[]
```

## Firebase Integration

### Чтение данных

```typescript
// Получение всех товаров
const allProducts = await getDataByPath<Record<string, Product>>(
  'shop/products',
  {}
)
```

### Обновление статуса брони

```typescript
await updateDataByPath(
  { isReserved: pendingValue },
  `shop/products/product_${productId}`
)
```

### Удаление товара

```typescript
await removeDataByPath(`shop/products/product_${productid}`)
```

## Yandex Storage Integration

Удаление файлов из хранилища:

```typescript
const { deleteFile } = useYandexDatabase()

// Получение имен файлов
const filesToDelete = shopStore.getProductFileName(productid)

// Удаление каждого файла
for (const file in filesToDelete) {
  await deleteFile(file)
}
```

## Поток управления бронью

### Шаг 1: Переключение статуса
```
Нажать на toggle →
Статус меняется локально →
Появляется кнопка "Подтвердить"
```

### Шаг 2: Подтверждение
```
Нажать "Подтвердить" →
Данные отправляются в Firebase →
Статус обновляется в базе →
Pending состояние сбрасывается →
Показывается уведомление
```

### Шаг 3: Отмена
```
Снова нажать на toggle →
Статус возвращается к исходному →
Кнопка "Подтвердить" исчезает
```

## Поток удаления товара

### Шаг 1: Проверка
```
Нажать "Удалить" →
Подтверждение (confirm) →
Проверка: не последний ли товар?
```

### Шаг 2: Удаление
```
Если не последний →
Получить имена файлов →
Удалить файлы из Yandex Storage →
Удалить запись из Firebase
```

## Безопасность

### Защита от удаления последнего товара

```typescript
if (allProducts && Object.keys(allProducts).length === 1) {
  alert(
    'Нельзя удалить последний товар. Добавь другой, и затем удали ненужный'
  )
  return
}
```

### Валидация

- Подтверждение удаления через `confirm()`
- Проверка наличия файлов перед удалением
- Обработка ошибок при обновлении статуса

## UI/UX

### Дизайн

- Карточки товаров в списке
- Hover эффекты для интерактивных элементов
- Цветовая кодировка статусов:
  - Amber-600 для брони
  - Gray для доступных товаров
- Иконки для действий

### Взаимодействие

- Toggle переключатель для статуса брони
- Inline редактирование статуса
- Кнопка подтверждения только при наличии изменений
- Мгновенное отображение pending изменений

### Цветовая кодировка

```typescript
// Статус брони
'Dоступен': text-gray-600, bg-gray-200
'Забронирован': text-amber-600, bg-amber-600
'В брони': text-amber-600 (pending)
```

### Empty State

Если товаров нет, отображается:
- Иконка коробки
- Заголовок "Товаров пока нет"
- Текст "Добавьте первый товар через форму выше"

## Примеры использования

### Управление бронью товара

```javascript
// Переключение в брони
toggleReservation(1)
// pendingReservations.value[1] = true

// Подтверждение
await confirmReservation(1)
// Статус сохранен в Firebase
// pendingReservations.value[1] = undefined
```

### Удаление товара

```javascript
// Нажать "Удалить" → confirm → await removeProduct(123)

// Внутри:
// 1. Проверка: не последний товар
// 2. Получение файлов: ['image1.jpg', 'image2.jpg']
// 3. Удаление файлов из Yandex Storage
// 4. Удаление записи из Firebase: shop/products/product_123
```

## Обработка ошибок

### При обновлении статуса брони

```typescript
try {
  await updateDataByPath(...)
  showToast(
    'Успешно!',
    `Статус брони товара обновлен на "${pendingValue ? 'Забронирован' : 'Доступен'}"`,
    'heroicons:check-circle'
  )
} catch (error) {
  console.error('Ошибка при обновлении статуса брони:', error)
  showToast(
    'Ошибка',
    'Не удалось обновить статус брони. Попробуйте еще раз.',
    'heroicons:exclamation-circle'
  )
  // Сброс pending состояния при ошибке
  Reflect.deleteProperty(pendingReservations.value, productId)
}
```

## Интеграция с админ-панелью

Компонент добавлен в [`/pages/admin/dashboard.vue`](../pages/admin/dashboard.vue):

```typescript
const dashboardModals: Record<DashBoardOption, Component> = {
  ProductsList: defineAsyncComponent(
    () => import('@/components/dashboard/ProductsList.vue'),
  ),
}
```

Доступен в селекторе модулей как "Список товаров".

## Типы данных

```typescript
// /types/index.ts
export interface Product {
  id: number
  title: string
  stock: number
  price: number
  isReserved?: boolean
  // ... остальные поля
}

export type DashBoardOption = 'ProductsList'
```

## Особенности

### Pending система

- Изменения сохраняются локально до подтверждения
- Предотвращает случайные изменения
- Позволяет визуально предпросмотреть изменение
- Отмена без сохранения (переключение обратно)

### Batch операции

- При удалении товара удаляются все связанные файлы
- При удалении последнего товара блокируется операция
- Асинхронные операции с Promise.all для файлов

### Реактивность

- Мгновенное обновление UI при изменении статуса
- Автоматическая перезагрузка при изменениях в Firebase
- Подписка на store для обновления списка

## Будущие улучшения

- [ ] Массовое изменение статуса брони
- [ ] Фильтрация по категориям
- [ ] Сортировка товаров
- [ ] Редактирование товаров прямо в списке
- [ ] Поиск по названию
- [ ] Экспорт списка товаров в CSV
- [ ] Статистика продаж по товарам
- [ ] Рекомендуемые товары для брони
- [ ] Уведомления при покупке забронированного товара
