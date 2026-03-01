# Галерея выставки (работы)

Компонент для отображения работ выставки в виде карусели.

**Расположение**: [`/components/exhibitions/ExhibitionGallery.vue`](../components/exhibitions/ExhibitionGallery.vue)

**Store**: [`/stores/shop.ts`](../stores/shop.ts)

**Composable**: [`/composables/useProductModal.ts`](../composables/useProductModal.ts)

## Обзор

Компонент выполняет следующие функции:
1. Отображение работ выставки в карусели
2. Фильтрация товаров по названиям работ
3. Добавление работ в корзину
4. Модальное окно для просмотра работ
5. Empty state если работ нет

## Использование

```vue
<script setup lang="ts">
import ExhibitionGallery from '@/components/exhibitions/ExhibitionGallery.vue'
</script>

<template>
  <ExhibitionGallery :works="exhibitionWorks" />
</template>
```

## Функционал

### 1. Отображение работ выставки

- **Карусель** для навигации по работам
- **Responsive layout**:
  - Mobile: 1 колонка
  - Tablet: 2 колонки
  - Desktop: 3 колонки
  - Large: 4 колонки
- **Автоплей** для автоматической прокрутки

### 2. Фильтрация товаров

Фильтрация товаров по названиям работ выставки:

```typescript
const workTitles = props.works.map(work => work.title.toLowerCase().trim())

return shopStore.allProducts.filter(product => {
  const productTitle = product.title.toLowerCase().trim()
  return workTitles.some(workTitle => productTitle === workTitle)
})
```

### 3. Управление корзиной

- Добавление товаров в корзину
- Покупка сейчас (переход к оформлению)
- Проверка наличия в корзине

### 4. Модальное окно

- Просмотр товара в модальном окне
- Детальная информация о работе

## Структура данных

### Props

```typescript
interface Props {
  works: ExhibitionWork[]
}
```

### ExhibitionWork

```typescript
interface ExhibitionWork {
  id: number                  // Уникальный ID
  title: string               // Название работы
  // ... другие поля
}
```

### Product

```typescript
interface Product {
  id: number
  title: string
  price: number
  image: string[]
  // ... остальные поля
}
```

## Компонент

### Props

```typescript
const props = defineProps<{
  works: ExhibitionWork[]
}>()
```

### Computed Properties

```typescript
// Отфильтрованные товары
filteredProducts: Product[]
```

### Methods

```typescript
// Проверка наличия в корзине
checkStatus(prod: Product): boolean

// Добавление в корзину
addToBasket(product: Product): Promise<void>

// Покупка сейчас
buyNow(product: Product): Promise<void>
```

## Store Integration

### useShopStore

```typescript
import { useShopStore } from '~/stores/shop'

const shopStore = useShopStore()

// Все товары в магазине
shopStore.allProducts: Product[]
```

### useBasketStore

```typescript
import { useBasketStore } from '~/stores/basket'

const basketStore = useBasketStore()
const { addShopItemToBasket } = useBasketStore()

// Корзина
basketStore.shoppingCart: Purchase[]

// Добавление в корзину
addShopItemToBasket(purchase: Purchase)
```

## useProductModal

```typescript
import { useProductModal } from '~/composables/useProductModal'

const { isProductModalOpen, selectedProduct, closeModal } = useProductModal(
  computed(() => filteredProducts.value)
)

// Состояние модального окна
isProductModalOpen: ComputedRef<boolean>

// Выбранный товар
selectedProduct: ComputedRef<Product | null>

// Закрытие модального окна
closeModal(): void
```

## Фильтрация товаров

```typescript
const filteredProducts = computed<Product[]>(() => {
  // Проверка наличия работ
  if (!props.works || props.works.length === 0) return []

  // Получение названий работ выставки
  const workTitles = props.works.map(
    work => work.title.toLowerCase().trim()
  )

  // Фильтрация товаров по названиям
  return shopStore.allProducts.filter(product => {
    const productTitle = product.title.toLowerCase().trim()
    return workTitles.some(workTitle => productTitle === workTitle)
  })
})
```

## UCarousel Configuration

```typescript
const carouselUI = {
  item: 'basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4',
}
```

## UI/UX

### Дизайн

- Карусель с dots
- Автоплей для автоматической прокрутки
- Empty state если работ нет
- Адаптивная сетка

### Заголовок

```vue
<header>
  <h2>Представленные акварели</h2>
  <p>Их можно купить после завершения выставки</p>
</header>
```

### Карусель

```vue
<UCarousel
  v-slot="{ item }"
  :items="filteredProducts"
  dots
  autoplay
  :ui="carouselUI"
>
  <ShopItem
    :product="item"
    :is-in-basket="checkStatus(item)"
    @buy="buyNow"
    @add-to-basket="addToBasket"
    @filter-by-tag="() => {}"
  />
</UCarousel>
```

### Empty State

```vue
<div v-if="filteredProducts.length === 0">
  <p>Работы для этой выставки пока не добавлены.</p>
</div>
```

## Добавление в корзину

```typescript
const addToBasket = async (product: Product) => {
  // Задержка для визуального эффекта
  await new Promise(resolve => setTimeout(resolve, 300))

  // Подготовка данных
  const { description, categoryId, tags, ...purchaseParams } = product

  const purchase = {
    amount: 1,
    item: purchaseParams,
  }

  // Добавление в store
  addShopItemToBasket(purchase)
}
```

## Покупка сейчас

```typescript
const buyNow = async (product: Product) => {
  // Добавление в корзину
  addToBasket(product)

  // Задержка
  await new Promise(resolve => setTimeout(resolve, 500))

  // Переход к оформлению
  navigateTo('/basket')
}
```

## Примеры использования

### Базовое использование

```vue
<script setup lang="ts">
const exhibitionWorks = ref<ExhibitionWork[]>([
  {
    id: 1,
    title: 'Рыбаки в миниатюре'
  },
  {
    id: 2,
    title: 'Пейзаж с рекой'
  }
])
</script>

<template>
  <ExhibitionGallery :works="exhibitionWorks" />
</template>
```

### Нет работ

```vue
<ExhibitionGallery :works="[]" />
```

Будет показано: "Работы для этой выставки пока не добавлены."

### Работы не найдены в магазине

```vue
<script setup lang="ts">
// Товары с такими названиями отсутствуют в магазине
const exhibitionWorks = ref<ExhibitionWork[]>([
  {
    id: 1,
    title: 'Несуществующая работа'
  }
])
</script>

<template>
  <ExhibitionGallery :works="exhibitionWorks" />
</template>
```

Будет показано: "Работы для этой выставки пока не добавлены."

## Типы данных

```typescript
// /types/index.ts
export interface ExhibitionWork {
  id: number
  title: string
}

export interface Product {
  id: number
  title: string
  price: number
  image: string[]
  description?: string
  stock: number
}
```

## Особенности

### Фильтрация

- Case-insensitive сравнение
- Trim пробелов
- Точное совпадение названий

### Производительность

- Computed для отслеживания изменений
- Фильтрация по названию (O(n*m) complexity)
- Lazy loading товаров

### UX улучшения

- Автоплей карусели
- Задержки для визуального эффекта
- Мгновенное добавление в корзину

## Будущие улучшения

- [ ] Раздельная загрузка работ выставки
- [ ] Фильтрация по категориям
- [ ] Сортировка по цене/дате
- [ ] Вложенные работы (подразделы)
- [ ] Быстрый просмотр (hover)
- [ ] Кнопки "Поделиться"
- [ ] Сохранение избранного
- [ ] Фильтрация по цене
- [ ] Количество товаров на странице
- [ ] Статус доступности (скоро в продаже)
