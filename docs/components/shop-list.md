# Список товаров магазина

Компонент для отображения списка товаров магазина с пагинацией.

**Расположение**: [`/components/shop/List.vue`](../components/shop/List.vue)

**Store**: [`/stores/shop.ts`](../stores/shop.ts)

**Composable**: [`/composables/useProductModal.ts`](../composables/useProductModal.ts)

## Обзор

Компонент выполняет следующие функции:
1. Отображение списка товаров с пагинацией
2. Фильтрация по тегам
3. Управление корзиной (добавление, покупка)
4. Предпросмотр товара в модальном окне
5. Обработка ошибок загрузки
6. Skeleton loader при загрузке

## Использование

```vue
<script setup lang="ts">
import ShopList from '@/components/shop/List.vue'
</script>

<template>
  <ShopList />
</template>
```

## Функционал

### 1. Отображение товаров

- **Grid layout**: 1 колонка (mobile), 2 (tablet), 3 (desktop)
- **Skeleton loader** — при загрузке данных
- **Error state** — при ошибке загрузки
- **Empty state** — когда нет товаров

### 2. Пагинация

- Количество товаров на странице: `shopStore.itemsPerPage`
- Навигация по страницам
- URL query параметр `?page=2`
- Автоматический скролл вверх при смене страницы

### 3. Фильтрация по тегам

- Клик по тегу в карточке товара
- Добавление/удаление тега из фильтров
- Мгновенная фильтрация списка
- Сброс страницы при фильтрации

### 4. Управление корзиной

- **Добавить в корзину** — добавление товара в корзину
- **Купить сейчас** — добавление и переход к оформлению
- Проверка наличия в корзине

### 5. Модальное окно товара

- Отображение расширенной информации
- Карусель изображений
- Подробное описание и характеристики

## Структура данных

### Product

```typescript
interface Product {
  id: number              // Уникальный ID
  title: string           // Название
  description?: string    // Описание
  price: number           // Цена
  stock: number           // Количество на складе
  image: string[]         // URL изображений
  tags?: string[]         // Теги для фильтрации
  categoryId: string      // Категория
  size: string           // Размер
  material: string       // Материалы
  tecnic: string         // Техника
  year: string           // Год
  isReserved?: boolean   // Статус брони
}
```

## Компонент

### Props

Нет (использует глобальное состояние store).

### Computed Properties

```typescript
// Отфильтрованные товары по тегам
searchedProducts: Product[]

// Товары на текущей странице
paginatedProducts: Product[]

// Общее количество товаров
totalItems: number

// Ошибка загрузки
error: Error | null

// Сообщение об ошибке
errorMessage: string
```

### Methods

```typescript
// Проверка наличия в корзине
checkStatus(prod: Product): boolean

// Добавление в корзину
addToBasket(product: Product): Promise<void>

// Покупка сейчас
buyNow(product: Product): Promise<void>

// Обработка клика по тегу
handleTagCLick(tag: string): void

// Обработка смены страницы
handlePageChange(page: number): void
```

### Events (emit)

Компонент ShopItem генерирует события:
```typescript
interface ShopItemEvents {
  addToBasket: (product: Product) => void
  buy: (product: Product) => void
  filterByTag: (tag: string) => void
}
```

## Store Integration

Использует `useShopStore()`:

```typescript
import { useShopStore } from '~/stores/shop'

const shopStore = useShopStore()

// Все товары
shopData: Product[] | Error

// Отфильтрованные товары
searchedProducts: Product[]

// Текущая страница
currentPage: number

// Товары на странице
paginatedProducts: Product[]

// Общее количество
totalItems: number

// Количество на странице
itemsPerPage: number

// Выбранные теги
selectedTags: string[]

// Фильтрация по тегам
shopStore.filterProductsByTags(): Product[]

// Управление тегами
shopStore.addTag(tag: string): void
shopStore.removeTag(tag: string): void
shopStore.setPage(page: number): void
```

## Composable Integration

### useProductModal

```typescript
const { isProductModalOpen, selectedProduct, closeModal } = useProductModal()

// Состояние модального окна
isProductModalOpen: ComputedRef<boolean>

// Выбранный товар
selectedProduct: ComputedRef<Product | null>

// Закрытие модального окна
closeModal(): void
```

## Поток работы с корзиной

### Добавление в корзину

```typescript
// 1. Проверка наличия в корзине
const { isInBasket } = useProductInBasket(product.id)

// 2. Добавление товара
const { description, categoryId, tags, ...purchaseParams } = product

const purchase = {
  amount: 1,
  item: purchaseParams,
}

addShopItemToBasket(purchase)

// 3. Задержка для визуального эффекта
await new Promise(resolve => setTimeout(resolve, 300))
```

### Покупка сейчас

```typescript
// 1. Добавление в корзину
addToBasket(product)

// 2. Задержка
await new Promise(resolve => setTimeout(resolve, 500))

// 3. Переход к оформлению
router.push('/basket')
```

## Поток фильтрации по тегам

```typescript
// 1. Клиент кликает по тегу
handleTagCLick(tag: string)

// 2. Добавление или удаление тега
if (shopStore.selectedTags.includes(tag)) {
  shopStore.removeTag(tag)
} else {
  shopStore.addTag(tag)
}

// 3. Фильтрация списка
searchedProducts.value = shopStore.filterProductsByTags()

// 4. Сброс страницы
if (route.query.page) {
  router.push({ query: { ...route.query, page: undefined } })
}
```

## Поток пагинации

```typescript
// 1. Изменение страницы в компоненте UPagination
const handlePageChange = (page: number) => {
  if (isUpdatingPage.value) return  // Защита от многократных вызовов

  isUpdatingPage.value = true

  // 2. Обновление страницы в store
  shopStore.setPage(page)

  // 3. Обновление URL
  router.push({
    query: { ...route.query, page: page.toString() }
  }).then(() => {
    // 4. Скролл наверх
    window.scrollTo({ top: 0, behavior: 'smooth' })
    isUpdatingPage.value = false
  })
}
```

## UI/UX

### Дизайн

- Responsive grid layout
- Tailwind CSS для стилизации
- Skeleton loader при загрузке
- Карточки товаров с hover эффектами
- Цветовая кодировка тегов

### Состояния загрузки

#### Loading State
```vue
<template v-if="isLoading">
  <div v-for="n in 3" class="skeleton-card">
    <USkeleton class="h-[200px] w-full" />
    <USkeleton class="h-4 w-3/4" />
    <USkeleton class="h-3 w-full" />
    <USkeleton class="h-10 w-full" />
  </div>
</template>
```

#### Error State
```vue
<template v-else-if="error">
  <UAlert
    title="Ошибка загрузки товаров"
    :description="errorMessage"
    icon="heroicons:exclamation-triangle"
    color="error"
  />
</template>
```

### Пагинация

Компонент `UPagination` с настройками:
- Color: neutral
- Active color: neutral
- Sibling count: 1
- Show controls
- Items per page: `shopStore.itemsPerPage`

## Обработка ошибок

```typescript
const error = computed(() => {
  // Ошибка в данных
  if (shopData.value instanceof Error) {
    return shopData.value
  }

  // Данные не загружены
  if (!shopData || Object.keys(shopData).length === 0) {
    return new Error('Данные не загружены')
  }

  return null
})

const errorMessage = computed(() => {
  if (!error.value) return ''
  return error.value.message ||
    'Не удалось загрузить товары из магазина. Пожалуйста, попробуйте позже.'
})
```

## SEO и роутинг

### URL параметры

```
/shop?page=2
/shop?tag=акварель
/shop?page=2&tag=масло
```

### URL persistence

Страница синхронизируется с URL:
```typescript
onMounted(() => {
  if (route.query.page) {
    const page = Number(route.query.page)
    if (!isNaN(page) && page > 0) {
      shopStore.setPage(page)
    }
  }
})
```

## Примеры использования

### Фильтрация по тегам

```javascript
// Клик по тегу "акварель"
handleTagCLick('акварель')

// Тег добавляется в selectedTags
shopStore.selectedTags = ['акварель']

// Список фильтруется
searchedProducts.value = shopStore.filterProductsByTags()
```

### Навигация по страницам

```javascript
// Переход на страницу 2
handlePageChange(2)

// URL обновляется: /shop?page=2
// Страница прокручивается наверх
// Загружаются товары страницы 2
```

### Добавление в корзину

```javascript
// Добавление товара
await addToBasket(product)

// Товар добавляется в basketStore.shoppingCart
// Кнопка меняется на "В корзине"
// Показывается toast уведомление
```

## Типы данных

```typescript
// /types/index.ts
export interface Product {
  id: number
  title: string
  description?: string
  price: number
  stock: number
  image: string[]
  tags?: string[]
  categoryId: string
  size: string
  material: string
  tecnic: string
  year: string
  isReserved?: boolean
}
```

## Особенности

### Защита от дублирования

- Флаг `isUpdatingPage` предотвращает множественные запросы
- Debounce для операций с корзиной
- Проверка на наличие в корзине перед добавлением

### Responsive дизайн

- Mobile: 1 колонка
- Tablet: 2 колонки
- Desktop: 3 колонки
- Адаптивные размеры карточек

### Оптимистичные обновления

- Мгновенное обновление UI при действиях
- Задержки для визуальной обратной связи
- Обработка ошибок с откатом

## Будущие улучшения

- [ ] Infinite scroll вместо пагинации
- [ ] Фильтрация по цене
- [ ] Сортировка по цене/дате
- [ ] Сохранение фильтров в localStorage
- [ ] Быстрый просмотр без модального окна
- [ ] Добавление в избранное
- [ ] Сравнение товаров
- [ ] Умные рекомендации
- [ ] Поиск по названию
- [ ] Автоматическое восстановление позиции скролла
