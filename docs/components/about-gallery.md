# Галерея работ (страница "О художнике")

Компонент для отображения галереи работ художника на странице "О художнике".

**Расположение**: [`/components/about/Gallery.vue`](../components/about/Gallery.vue)

**Store**: [`/stores/shop.ts`](../stores/shop.ts)

**Component**: [`/components/FlipCard.vue`](../components/FlipCard.vue)

## Обзор

Компонент выполняет следующие функции:
1. Отображение заголовка галереи
2. Фильтрация товаров по категории
3. Карусель работ с flip-карточками
4. Локализация заголовка и описания

## Использование

```vue
<script setup lang="ts">
import AboutGallery from '@/components/about/Gallery.vue'
</script>

<template>
  <AboutGallery />
</template>
```

## Функционал

### 1. Отображение заголовка

- **Заголовок**: `about_gallery_title`
- **Описание**: `about_gallery_subtitle`
- Центрированное позиционирование
- Responsive размеры текста

### 2. Фильтрация товаров

```typescript
const productsForGallery = computed(() => {
  return shopStore.allProducts.filter(prod => prod.categoryId === '1')
})
```

Фильтрует товары с `categoryId === '1'` (картины).

### 3. Карусель

- **Auto-scroll** — автоматическая прокрутка
- **Wheel gestures** — поддержка прокрутки колесом
- **Loop** — бесконечная прокрутка
- **Responsive layout**:
  - Mobile: 1 колонка
  - Tablet: 2 колонки
  - Desktop: 3 колонки

### 4. Flip-карточки

Каждая работа отображается как FlipCard с:
- Изображением
- Названием
- Описанием
- Flip-эффектом при hover

## Структура данных

### Props

Нет (компонент использует store).

### Product

```typescript
interface Product {
  id: number
  title: string
  description?: string
  image: string[]
  categoryId: string
  // ... остальные поля
}
```

## Store Integration

### useShopStore

```typescript
import { useShopStore } from '~/stores/shop'

const shopStore = useShopStore()

// Все товары
shopStore.allProducts: Product[]
```

### Filter Logic

```typescript
const productsForGallery = computed(() => {
  // Фильтрация по categoryId === '1'
  return shopStore.allProducts.filter(prod => prod.categoryId === '1')
})
```

## UCarousel Configuration

```typescript
const carouselUI = {
  item: 'basis-1/1 sm:basis-1/2 lg:basis-1/3',
}
```

## FlipCard Props

```typescript
interface FlipCardProps {
  title: string           // Название работы
  description?: string   // Описание
  image: string          // URL изображения
}
```

## UI/UX

### Заголовок

```vue
<div class="text-center mb-8">
  <h2 class="text-2xl md:text-3xl">
    {{ printLocale('about_gallery_title') }}
  </h2>
  <p class="text-sm md:text-base">
    {{ printLocale('about_gallery_subtitle') }}
  </p>
</div>
```

### Карусель

```vue
<UCarousel
  auto-scroll
  wheel-gestures
  loop
  :items="productsForGallery"
  :ui="carouselUI"
>
  <div class="flex flex-col items-center">
    <FlipCard
      v-if="item.image"
      :title="item.title"
      :description="item.description"
      :image="item.image[0]"
    />
  </div>
</UCarousel>
```

## Локализация

### useLocales

```typescript
import { useLocales } from '~/composables/useLocales'

const { printLocale } = useLocales()

// Вывод локализованного текста
printLocale('about_gallery_title')
printLocale('about_gallery_subtitle')
```

### Ключи локализации

```typescript
'about_gallery_title'      // Заголовок галереи
'about_gallery_subtitle'   // Описание галереи
```

## Примеры использования

### Базовое использование

```vue
<script setup lang="ts">
import AboutGallery from '@/components/about/Gallery.vue'
</script>

<template>
  <AboutGallery />
</template>
```

### С другой категорией

```vue
<script setup lang="ts">
const shopStore = useShopStore()

const productsForGallery = computed(() => {
  return shopStore.allProducts.filter(prod => prod.categoryId === '2')
})
</script>

<template>
  <section>
    <UCarousel :items="productsForGallery">
      <FlipCard
        v-if="item.image"
        :title="item.title"
        :description="item.description"
        :image="item.image[0]"
      />
    </UCarousel>
  </section>
</template>
```

## Адаптивность

### Размеры текста

```css
text-2xl      /* Mobile */
md:text-3xl   /* Desktop */
```

### Grid layout

```css
basis-1/1      /* Mobile: 1 колонка */
sm:basis-1/2   /* Tablet: 2 колонки */
lg:basis-1/3   /* Desktop: 3 колонки */
```

## SEO

- Семантический тег `section`
- Alt тексты для изображений
- Правильные заголовки

## Производительность

- Computed для фильтрации
- Lazy loading изображений (UCarousel)
- Virtual scroll (опционально)

## Доступность

- Семантические теги
- Alt тексты для изображений
- Focus состояния
- Поддержка клавиатуры

## Будущие улучшения

- [ ] Фильтрация по нескольким категориям
- [ ] Сортировка по цене/дате
- [ ] Кнопки "Показать еще"
- [ ] Grid layout переключатель
- [ ] Фильтрация по технике
- [ ] Поиск по названию
- [ ] Избранное
- [ ] Социальные кнопки (share)
- [ ] Лайтбокс для просмотра
- [ ] Анимации при загрузке
