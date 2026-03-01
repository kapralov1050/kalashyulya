# Карточка товара магазина

Компонент для отображения отдельного товара в магазине.

**Расположение**: [`/components/shop/Item.vue`](../components/shop/Item.vue)

## Обзор

Компонент выполняет следующие функции:
1. Отображение карточки товара с изображением
2. Отображение цены и названия
3. Отображение тегов для фильтрации
4. Показ статуса брони
5. Добавление в корзину
6. Покупка сейчас
7. Переход на страницу товара

## Использование

```vue
<script setup lang="ts">
import ShopItem from '@/components/shop/Item.vue'
</script>

<template>
  <ShopItem
    :product="product"
    :is-in-basket="isInBasket"
    @add-to-basket="addToBasket"
    @buy="buyNow"
    @filter-by-tag="filterByTag"
  />
</template>
```

## Функционал

### 1. Отображение товара

- **Изображение** — первое изображение из массива `product.image`
- **Название** — `product.title`
- **Цена** — `product.price` ₽
- **Теги** — `product.tags` для фильтрации
- **Статус брони** — бейдж если товар забронирован

### 2. Клик по изображению

- Переход на страницу товара с детальной информацией
- Обновление URL query параметра `?id=123`
- Трекинг клика в метриках

### 3. Статус брони

Если товар забронирован (`isReserved: true`):
- Отображается бейдж "Бронь"
- Цвет: amber-500
- Анимация wiggle при hover

### 4. Управление корзиной

- **В корзине** — кнопка становится зеленой, текст "В корзине"
- **Купить** — кнопка для покупки товара
- **Корзина** — иконка корзины для добавления

## Структура данных

### Props

```typescript
interface Props {
  product: Product       // Данные товара
  isInBasket: boolean    // Товар в корзине?
}
```

### Product

```typescript
interface Product {
  id: number              // Уникальный ID
  title: string           // Название
  price: number           // Цена
  stock: number           // Количество на складе
  image: string[]         // URL изображений
  tags?: string[]         // Теги для фильтрации
  isReserved?: boolean    // Статус брони
}
```

### Emits

```typescript
interface Emits {
  addToBasket: [product: Product]    // Добавление в корзину
  buy: [product: Product]          // Покупка сейчас
  filterByTag: [tag: string]      // Фильтрация по тегу
  openModal: [product: Product]    // Открытие модального окна
}
```

## Компонент

### State

Нет (использует props).

### Methods

```typescript
// Открытие страницы товара
openProductPage(): void
```

## UI/UX

### Дизайн

- Карточка с скругленными углами
- Hover эффекты:
  - Подъем карточки (`-translate-y-1`)
  - Увеличение тени
  - Масштабирование изображения
- Адаптивные размеры

### Цветовая кодировка

#### Теги

```css
/* Основной цвет */
border-primary-500
bg-primary-50
text-primary-700

/* Dark mode */
dark:border-primary-400/70
dark:bg-primary-400/10
dark:text-primary-300
```

#### Кнопки

```typescript
// В корзине
color: 'success'
variant: 'secondary'

// Не в корзине
color: 'secondary'
variant: 'solid'
```

#### Бейдж брони

```css
.bg-amber-500
.text-white
px-4 py-1.5
rounded-full
shadow-sm
```

### Анимации

```css
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
}

.reservation-badge:hover {
  animation: wiggle 0.5s ease-in-out;
}
```

## Взаимодействие

### Клик по изображению

```typescript
function openProductPage() {
  // Трекинг клика
  metrics.trackButtonClick('productExtendedButton')

  // Обновление URL
  router.push({
    query: {
      ...route.query,
      id: props.product.id,
    },
    hash: route.hash,
  })
}
```

### Добавление в корзину

```vue
<UButton
  :color="isInBasket ? 'success' : 'secondary'"
  size="sm"
  @click="emit('addToBasket', product)"
>
  {{ isInBasket ? 'В корзине' : 'Купить' }}
</UButton>
```

### Клик по тегу

```vue
<div
  v-for="tag in product.tags"
  :key="tag"
  @click="emit('filterByTag', tag)"
>
  {{ tag }}
</div>
```

## Метрики

Трекинг кликов по карточке товара:

```typescript
metrics.trackButtonClick('productExtendedButton')
```

## SEO и роутинг

### URL параметры

При клике на карточку:

```
/shop?id=123
/shop?page=2&id=123
```

### Hash persistence

Хэш сохраняется при переходе:

```typescript
router.push({
  query: { ...route.query, id: props.product.id },
  hash: route.hash,
})
```

## Примеры использования

### Базовое использование

```vue
<script setup lang="ts">
const product = ref<Product>({
  id: 1,
  title: 'Пейзаж',
  price: 15000,
  image: ['https://.../image.jpg'],
  tags: ['акварель', 'пейзаж'],
  stock: 1,
  isReserved: false
})

const isInBasket = computed(() => checkInBasket(product.value.id))
</script>

<template>
  <ShopItem
    :product="product"
    :is-in-basket="isInBasket"
    @add-to-basket="addToBasket"
    @buy="buyNow"
    @filter-by-tag="filterByTag"
  />
</template>
```

### Забронированный товар

```vue
<ShopItem
  :product="{
    ...product,
    isReserved: true
  }"
  :is-in-basket="false"
/>
```

Будет отображен бейдж "Бронь" с анимацией.

### Товар в корзине

```vue
<ShopItem
  :product="product"
  :is-in-basket="true"
/>
```

Кнопка станет зеленой с текстом "В корзине".

## Доступность

- Alt текст для изображений
- Семантические теги (article, section, header, footer)
- Hover и focus состояния
- Цветовой контраст

## Типы данных

```typescript
// /types/index.ts
export interface Product {
  id: number
  title: string
  price: number
  stock: number
  image: string[]
  tags?: string[]
  isReserved?: boolean
  // ... остальные поля
}

interface ShopItemProps {
  product: Product
  isInBasket: boolean
}

interface ShopItemEmits {
  addToBasket: (product: Product) => void
  buy: (product: Product) => void
  filterByTag: (tag: string) => void
  openModal: (product: Product) => void
}
```

## Особенности

### Адаптивность

- Mobile: полная ширина
- Tablet: grid 2 колонки
- Desktop: grid 3 колонки

### Оптимизация изображений

- Использование первого изображения из массива
- Placeholder изображение если массив пуст
- Lazy loading (опционально)

### Отзывчивость

- Мгновенная реакция на изменения props
- Hover эффекты для интерактивных элементов
- Анимации для улучшения UX

## Будущие улучшения

- [ ] Рейтинг товара
- [ ] Количество просмотров
- [ ] Скидки и акции
- [ ] Быстрый просмотр (hover)
- [ ] Добавление в избранное
- [ ] Сравнение товаров
- [ ] Остаток на складе (количество)
- [ ] Доступные размеры (если несколько)
- [ ] Бейдж "Хит продаж"
- [ ] Таймер для акций
