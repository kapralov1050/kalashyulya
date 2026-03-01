# Карточка выставки

Компонент для отображения карточки выставки в списке.

**Расположение**: [`/components/exhibitions/ExhibitionCard.vue`](../components/exhibitions/ExhibitionCard.vue)

**Store**: [`/stores/exhibitions.ts`](../stores/exhibitions.ts)

## Обзор

Компонент выполняет следующие функции:
1. Отображение карточки выставки с изображением
2. Показ статуса выставки (планируется, идет, завершена)
3. Переход на страницу выставки
4. Локализация заголовка
5. Hover эффекты для интерактивности

## Использование

```vue
<script setup lang="ts">
import ExhibitionCard from '@/components/exhibitions/ExhibitionCard.vue'
</script>

<template>
  <ExhibitionCard :exhibition="exhibition" />
</template>
```

## Функционал

### 1. Отображение выставки

- **Изображение обложки** — `exhibition.coverImage`
- **Заголовок** — `exhibition.title` (с поддержкой локализации)
- **Даты проведения** — `exhibition.dateRange`
- **Короткое описание** — `exhibition.shortDescription`

### 2. Статус выставки

Отображается в правом нижнем углу изображения:

| Статус | Цвет | Текст |
|---------|------|-------|
| `planned` | blue-600 | Планируется |
| `ongoing` | emerald-600 | Сейчас проходит |
| `finished` | amber-500 | Завершена |
| default | neutral-600 | Статус |

### 3. Переход на страницу выставки

- Клик по карточке переход на `/exhibitions/${exhibition.slug}`
- NuxtLink для навигации

### 4. Локализация

```typescript
printLocale(exhibition?.title || '', { breakLn: true })
```

## Структура данных

### Props

```typescript
interface Props {
  exhibition: Exhibition
}
```

### Exhibition

```typescript
interface Exhibition {
  id: number                    // Уникальный ID
  slug: string                  // URL slug
  title: string                 // Заголовок (ключ локализации)
  dateRange: string             // Даты проведения
  shortDescription: string       // Короткое описание
  coverImage: string            // URL изображения обложки
  status: ExhibitionStatus       // Статус выставки
}
```

### ExhibitionStatus

```typescript
type ExhibitionStatus = 'planned' | 'ongoing' | 'finished'
```

## Компонент

### Props

```typescript
const props = defineProps<{
  exhibition: Exhibition
}>()
```

### Computed Properties

```typescript
// Текст статуса
statusLabel: string

// CSS классы для бейджа статуса
statusBadgeClasses: string
```

## Статус выставки

### Цветовая кодировка

```typescript
const statusBadgeClasses = computed(() => {
  switch (props.exhibition.status) {
    case 'planned':
      return 'bg-blue-600/90 dark:bg-blue-500/90'
    case 'ongoing':
      return 'bg-emerald-600/90 dark:bg-emerald-500/90'
    case 'finished':
      return 'bg-amber-500/95 dark:bg-amber-400/95'
    default:
      return 'bg-neutral-600/90'
  }
})
```

### Store Integration

```typescript
import { useExhibitionsStore } from '~/stores/exhibitions'

const { getStatusLabel } = useExhibitionsStore()

// Получение текстового представления статуса
const statusLabel = getStatusLabel(props.exhibition.status)
```

## UI/UX

### Дизайн

- Карточка с скругленными углами
- Hover эффекты:
  - Подъем карточки (`-translate-y-1`)
  - Увеличение тени
  - Масштабирование изображения
- Gradient overlay на изображении

### Изображение

```vue
<div class="relative aspect-[4/3] w-full overflow-hidden">
  <img
    :src="exhibition.coverImage"
    :alt="exhibition.title"
    class="h-full w-full object-cover transition-transform
      duration-500 group-hover:scale-105"
  />

  <div class="gradient-overlay" />
</div>
```

### Gradient Overlay

```css
.from-black/55
.via-black/15
.to-transparent
```

### Заголовок

```vue
<h3 v-html="printLocale(exhibition?.title || '', { breakLn: true })" />
```

Поддержка HTML для переноса строк в локализации.

### Бейдж статуса

```vue
<div
  class="absolute bottom-4 right-4 inline-flex items-center gap-1
    rounded-full px-3 py-1 text-xs font-semibold text-white"
  :class="statusBadgeClasses"
>
  <span class="inline-block size-1.5 rounded-full bg-white/90" />
  <span>{{ statusLabel }}</span>
</div>
```

## Локализация

### useLocales

```typescript
import { useLocales } from '~/composables/useLocales'

const { printLocale } = useLocales()

// Вывод локализованного текста
printLocale('exhibition_title_key', { breakLn: true })
```

### Параметры

- `breakLn: true` — поддержка переноса строк

## Роутинг

### NuxtLink

```vue
<NuxtLink :to="`/exhibitions/${exhibition.slug}`" class="block h-full">
  <!-- Карточка -->
</NuxtLink>
```

### URL

```
/exhibitions/spring-2025
/exhibitions/summer-exhibition
```

## Примеры использования

### Базовое использование

```vue
<script setup lang="ts">
const exhibition = ref<Exhibition>({
  id: 1,
  slug: 'spring-2025',
  title: 'exhibitions_spring_title',
  dateRange: '15 марта - 30 апреля 2025',
  shortDescription: 'Выставка весенних работ художницы.',
  coverImage: 'https://.../cover.jpg',
  status: 'ongoing'
})
</script>

<template>
  <ExhibitionCard :exhibition="exhibition" />
</template>
```

### Планируемая выставка

```vue
<ExhibitionCard
  :exhibition="{
    ...exhibition,
    status: 'planned'
  }"
/>
```

Бейдж будет blue-600.

### Завершенная выставка

```vue
<ExhibitionCard
  :exhibition="{
    ...exhibition,
    status: 'finished'
  }"
/>
```

Бейдж будет amber-500.

## Типы данных

```typescript
// /types/index.ts
export interface Exhibition {
  id: number
  slug: string
  title: string
  dateRange: string
  shortDescription: string
  coverImage: string
  status: ExhibitionStatus
}

export type ExhibitionStatus = 'planned' | 'ongoing' | 'finished'
```

## Особенности

### Адаптивность

- Fixed aspect ratio: 4/3
- Responsive text (line-clamp)
- Hover эффекты на всех устройствах

### SEO

- Alt текст для изображений
- Семантические теги (article)
- Slug для URL

### Производительность

- Lazy загрузка изображений (NuxtLink)
- CSS transitions (GPU accelerated)
- Hover состояния оптимизированы

### Доступность

- Alt текст для изображений
- Семантические теги
- Focus и hover состояния

## Будущие улучшения

- [ ] Дата начала и окончания отдельно
- [ ] Количество работ на выставке
- [ ] Категории выставок
- [ ] Фильтрация по статусу
- [ ] Сортировка по дате
- [ ] Поделиться выставкой
- [ ] Добавление в календарь
- [ ] Уведомления о начале выставки
- [ ] Анимации при загрузке
- [ ] Быстрый просмотр (hover)
