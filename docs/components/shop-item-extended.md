# Расширенная карточка товара (детальная страница)

Компонент для отображения детальной информации о товаре.

**Расположение**: [`/components/shop/ItemExtended.vue`](../components/shop/ItemExtended.vue)

**Composable**: [`/composables/useProductViews.ts`](../composables/useProductViews.ts)

**Composable**: [`/composables/useStructuredData.ts`](../composables/useStructuredData.ts)

## Обзор

Компонент выполняет следующие функции:
1. Отображение карусели изображений с лупой
2. Отображение детальной информации о товаре
3. Отображение счетчика просмотров
4. Добавление товара в корзину
5. SEO оптимизация и структурированные данные
6. Аккордеон для дополнительной информации

## Использование

```vue
<script setup lang="ts">
import ShopItemExtended from '@/components/shop/ItemExtended.vue'
</script>

<template>
  <ShopItemExtended :product="product" />
</template>
```

## Функционал

### 1. Карусель изображений

- **Carousel** для навигации по изображениям
- **Лупа** (VueMagnifier) для увеличения деталей
- Размер лупы адаптивный:
  - Desktop: 200px
  - Mobile: 100px
- Zoom фактор:
  - Desktop: 1.2x
  - Mobile: 2x

### 2. Детальная информация

- **Название** товара
- **Подтип** (например, "Картина Юлии Калашниковой")
- **Счетчик просмотров**
- **Описание** товара
- **Цена**

### 3. Дополнительная информация (аккордеон)

- Размер (в см)
- Материалы
- Техника
- Год создания
- Оформление (для картин и эскизов)

### 4. Статус товара

- **Забронирован** — бейдж amber
- **В наличии** — зеленый текст

### 5. Добавление в корзину

- Кнопка "Добавить в корзину" / "В корзине"
- Loading state при добавлении
- Задержка для визуального эффекта

## Структура данных

### Props

```typescript
interface Props {
  product: Product
}
```

### Product

```typescript
interface Product {
  id: number              // Уникальный ID
  title: string           // Название
  description?: string    // Описание
  price: number           // Цена
  categoryId: string      // Категория
  image: string[]         // URL изображений
  size: string           // Размер
  material: string       // Материалы
  tecnic: string         // Техника
  year: string           // Год
  framing?: FramingType[] // Оформление
  stock: number           // Количество
  isReserved?: boolean   // Статус брони
}
```

### AccordionItem

```typescript
interface AccordionItem {
  label: string          // Заголовок секции
  icon: string          // Иконка
  content?: string     // Содержимое (используется слот)
}
```

## Компонент

### State

```typescript
interface State {
  views: number                    // Количество просмотров
  isLoading: boolean              // Флаг загрузки
  contentRef: HTMLElement | null  // Ref для скролла
}
```

### Computed Properties

```typescript
// Размер лупы (адаптивный)
magnifierSize: number

// Zoom фактор (адаптивный)
zoom: number

// Подтип товара
subtitleProduct: string

// Текст оформления
framingLabel: string | null
```

### Methods

```typescript
// Добавление в корзину
addToBasket(product: Product): Promise<void>

// Анимация скролла
animateScroll(): void
```

## Composable Integration

### useProductViews

```typescript
const productId = String(route.query.id)
const { trackView, getViews } = useProductViews(productId)

// Трекинг просмотра
trackView()

// Получение количества просмотров
const views = getViews().value
```

### useStructuredData

```typescript
const { generateProduct, addStructuredData } = useStructuredData()

// Генерация структурированных данных
const productData = generateProduct({
  name: product.title,
  description: product.description,
  image: productImage,
  price: product.price,
  currency: 'RUB',
  availability: 'InStock',
  url: `${siteUrl}/shop/${product.id}`
})

// Добавление в head
addStructuredData(productData)
```

## SEO оптимизация

### Meta теги

```typescript
useSeo({
  title: product.title,
  description: product.description || `${product.title} - авторская работа`,
  image: productImage,
  type: 'website'
})
```

### Структурированные данные (JSON-LD)

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Название картины",
  "description": "Описание",
  "image": ["https://..."],
  "offers": {
    "@type": "Offer",
    "price": "15000",
    "priceCurrency": "RUB",
    "availability": "https://schema.org/InStock"
  }
}
```

## UI/UX

### Дизайн

- Grid layout: 2 колонки на desktop
- Left: карусель изображений
- Right: информация о товаре
- Dark mode поддержка
- Scrollbar скрыт

### Карусель изображений

```vue
<UCarousel
  :items="props.product.image"
  loop
  :dots="props.product.image.length > 1"
  touch="false"
>
  <VueMagnifier
    :src="item"
    :mg-width="magnifierSize"
    :mg-height="magnifierSize"
    :zoom-factor="zoom"
    :mg-show="!isCalendarCategory(props.product.categoryId)"
  />
</UCarousel>
```

### Лупа

- Отключена для календарей (isCalendarCategory)
- Размер адаптивный по ширине окна
- Touch offset для корректной работы на мобильных

### Аккордеон

```vue
<UAccordion type="multiple" :items="items">
  <template #content>
    <div class="pb-5">
      <p>Размер: {{ props.product.size }} см.</p>
      <p>Материал: {{ props.product.material }}</p>
      <p>Техника: {{ props.product.tecnic }}</p>
      <p>Год: {{ props.product.year }}</p>
      <p v-if="framingLabel">Оформление: {{ framingLabel }}</p>
    </div>
  </template>
</UAccordion>
```

### Анимация скролла

```typescript
const animateScroll = () => {
  const duration = 1500
  const scrollDistance = 100

  const step = () => {
    const progress = elapsed / duration
    if (progress < 1) {
      const y = scrollDistance * Math.sin(progress * Math.PI)
      container.scrollTop = y
      requestAnimationFrame(step)
    } else {
      container.scrollTop = 0
    }
  }
}
```

## Добавление в корзину

```typescript
const addToBasket = async (product: Product) => {
  setLoading(true)

  // Задержка для визуального эффекта
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Подготовка данных
  const { description, categoryId, tags, ...purchaseParams } = product

  const purchase = {
    amount: 1,
    item: purchaseParams,
  }

  // Добавление в store
  addShopItemToBasket(purchase)

  setLoading(false)
}
```

## Константы

```typescript
// /constants/products.ts
enum ProductCategory {
  PICTURES = 'pictures',
  SKETCHES = 'sketches',
  POSTCARDS = 'postcards',
  STICKERS = 'stickers',
  CALENDARS = 'calendars'
}

enum FramingType {
  FRAME = 'frame',
  PASSEPARTOUT = 'passepartout'
}

const FramingTypeLabels = {
  frame: 'В раме',
  passepartout: 'В паспарту'
}

function isCalendarCategory(categoryId: string): boolean {
  return categoryId === ProductCategory.CALENDARS
}
```

## Обработка touch событий

```typescript
onMounted(() => {
  const el = document.querySelector('.carousel-wrapper')
  if (el) {
    el.addEventListener('touchmove', e => {
      e.preventDefault()
    }, { passive: false })
  }
})
```

Это предотвращает скролл страницы при использовании карусели на мобильных устройствах.

## Примеры использования

### Базовое использование

```vue
<script setup lang="ts">
const product = ref<Product>({
  id: 1,
  title: 'Пейзаж с рекой',
  description: 'Акварельный пейзаж с изображением реки',
  price: 15000,
  categoryId: 'pictures',
  image: ['https://.../image1.jpg', 'https://.../image2.jpg'],
  size: '30*40',
  material: 'Бумага, акварель',
  tecnic: 'Акварель',
  year: '2025',
  framing: ['frame'],
  stock: 1,
  isReserved: false
})
</script>

<template>
  <ShopItemExtended :product="product" />
</template>
```

### Забронированный товар

```vue
<ShopItemExtended
  :product="{
    ...product,
    isReserved: true
  }"
/>
```

Будет отображен бейдж "Товар забронирован".

### Календарь (без лупы)

```vue
<ShopItemExtended
  :product="{
    ...product,
    categoryId: 'calendars'
  }"
/>
```

Лупа будет отключена для календарей.

## Типы данных

```typescript
// /types/index.ts
export interface Product {
  id: number
  title: string
  description?: string
  price: number
  categoryId: string
  image: string[]
  size: string
  material: string
  tecnic: string
  year: string
  framing?: FramingType[]
  stock: number
  isReserved?: boolean
}

export enum FramingType {
  FRAME = 'frame',
  PASSEPARTOUT = 'passepartout'
}
```

## Особенности

### Адаптивность

- Desktop: 2 колонки grid
- Mobile: 1 колонка
- Лупа адаптируется по размеру экрана

### Оптимизация

- Ленивая загрузка изображений
- Отключение лупы для календарей
- Prevent default для touch events

### SEO

- Meta теги для социальных сетей
- Структурированные данные JSON-LD
- Оптимизация для поисковиков

### UX улучшения

- Анимация скролла при монтировании
- Загрузка для добавления в корзину
- Инструкция по просмотрам

## Будущие улучшения

- [ ] Видео с обзором товара
- [ ] 360° просмотр
- [ ] Похожие товары
- [ ] Отзывы клиентов
- [ ] Галерея с zoom панорамированием
- [ ] Варианты оформления (рама, паспарту)
- [ ] Доставка и оплата на странице
- [ ] Кнопка "Сохранить"
- [ ] Анимации при добавлении в корзину
- [ ] Социальные кнопки (share)
