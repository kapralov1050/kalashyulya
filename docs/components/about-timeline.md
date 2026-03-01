# Timeline (хроника событий)

Компонент для отображения хронологии событий художника.

**Расположение**: [`/components/about/Timeline.vue`](../components/about/Timeline.vue)

**Composable**: [`/composables/useTimelineAnimation.ts`](../composables/useTimelineAnimation.ts)

**Data**: [`/data/timeline.ts`](../data/timeline.ts)

## Обзор

Компонент выполняет следующие функции:
1. Отображение SVG линии timeline
2. Отображение событий timeline
3. Анимация при скролле
4. Responsive масштабирование

## Использование

```vue
<script setup lang="ts">
import AboutTimeline from '@/components/about/Timeline.vue'
</script>

<template>
  <AboutTimeline />
</template>
```

## Функционал

### 1. SVG линия

- **Path**: изогнутая линия для визуальной привлекательности
- **Stroke**: `#7FC4F8` (blue-green цвет)
- **Gradient**: линейный градиент для линий и точек
- **Анимация**: stroke-dashoffset для "рисования" линии

### 2. Точки timeline

- Круги на линии
- Gradient fill
- Внутренние белые круги
- Позиционированы на path

### 3. События timeline

- Отображаются как `TimelineItem`
- Flex column layout
- Gap между элементами
- Центрированы по горизонтали

### 4. Анимация при скролле

- Линия "рисуется" при скролле
- Точки появляются по мере скролла
- Scroll-based animation

## Структура данных

### Timeline Item

```typescript
interface TimelineItem {
  id: number              // Уникальный ID
  year: string            // Год события
  title: string           // Заголовок
  description: string     // Описание
}
```

## SVG Configuration

### ViewBox

```xml
<svg
  width="1080"
  height="3030"
  viewBox="15 0 1050 3030"
>
```

### Path

```xml
<path
  id="scrollPath"
  d="M494.874 2.44315C..."
  stroke="#7FC4F8"
  class="stroke-[#7FC4F8] stroke-2 sm:stroke-3 md:stroke-[5] lg:stroke-[7]"
/>
```

### Gradient

```xml
<linearGradient id="timelineGrad" x1="0" x2="1" y1="0" y2="1">
  <stop offset="0" stop-color="#7FC4F8" />
  <stop offset="1" stop-color="#4A90E2" />
</linearGradient>
```

## Composable Integration

### useTimelineAnimation

```typescript
import { useTimelineAnimation } from '~/composables/useTimelineAnimation'

const { animate } = useTimelineAnimation()

// Анимация timeline
animate()
```

### scrollAnimation

```typescript
import {
  setupScrollAnimation,
  cleanupScrollAnimation
} from '~/helpers/scrollAnimation'

// Настройка анимации при скролле
setupScrollAnimation('#scrollPath')

// Очистка при размонтировании
cleanupScrollAnimation('#scrollPath')
```

## Data Integration

```typescript
import { timelineBlock } from '~/data/timeline'

const { timelineText } = timelineBlock()
```

## UI/UX

### Дизайн

```vue
<div class="container relative">
  <!-- SVG линия -->
  <svg class="absolute top-10 left-1/2 transform -translate-x-1/2 z-[-1]">
    <!-- Path и точки -->
  </svg>

  <!-- Элементы timeline -->
  <div class="container flex flex-col gap-y-25 items-center">
    <TimelineItem v-for="item in timelineText" :key="item.id" :item="item" />
  </div>
</div>
```

### Позиционирование SVG

```css
.absolute            /* Абсолютное позиционирование */
.top-10            /* 2.5rem сверху */
.left-1/2           /* По центру по горизонтали */
.transform          /* Для смещения */
.-translate-x-1/2     /* Смещение влево на 50% */
.z-[-1]             /* Под контентом */
```

### Масштабирование

```css
.translate-y-18       /* Mobile: 4.5rem вниз */
sm:translate-y-10     /* Desktop: 2.5rem вниз */

.scale-y-107         /* Mobile: 107% по вертикали */
.lg:scale-y-100      /* Desktop: 100% по вертикали */

.scale-x-35          /* Mobile: 35% по горизонтали */
.lg:scale-x-100      /* Desktop: 100% по горизонтали */
```

### Stroke width

```css
.stroke-2            /* Mobile: 2px */
sm:stroke-3          /* Tablet: 3px */
md:stroke-[5]        /* Desktop: 5px */
lg:stroke-[7]        /* Large: 7px */
```

### Flex layout элементов

```css
.flex flex-col       /* Вертикальный layout */
.gap-y-25           /* 6.25rem между элементами */
.items-center        /* Центрирование по горизонтали */
```

## Lifecycle

```typescript
onMounted(() => {
  // Настройка анимации при скролле
  setupScrollAnimation('#scrollPath')

  // Запуск анимации
  animate()
})

onBeforeUnmount(() => {
  // Очистка анимации
  cleanupScrollAnimation('#scrollPath')
})
```

## Примеры использования

### Базовое использование

```vue
<script setup lang="ts">
import AboutTimeline from '@/components/about/Timeline.vue'
</script>

<template>
  <AboutTimeline />
</template>
```

### С кастомными данными

```vue
<script setup lang="ts">
const customTimeline = [
  {
    id: 1,
    year: '2020',
    title: 'Начало пути',
    description: 'Первые работы...'
  },
  {
    id: 2,
    year: '2025',
    title: 'Выставка',
    description: 'Участие в выставке...'
  }
]
</script>

<template>
  <div class="container relative">
    <svg class="...">
      <!-- Custom SVG path -->
    </svg>
    <div class="container flex flex-col gap-y-25 items-center">
      <TimelineItem v-for="item in customTimeline" :key="item.id" :item="item" />
    </div>
  </div>
</template>
```

## Адаптивность

### Mobile

```css
.translate-y-18      /* Смещение вниз */
.scale-y-107         /* Вертикальный масштаб */
.scale-x-35          /* Горизонтальный масштаб */
```

### Desktop (lg)

```css
translate-y-10       /* Смещение вниз */
scale-y-100         /* Вертикальный масштаб */
scale-x-100         /* Горизонтальный масштаб */
```

## SEO

- Семантическая структура
- Правильные заголовки
- Alt тексты (если есть изображения)

## Производительность

- `will-change` для оптимизации анимаций
- Cleanup при размонтировании
- Computed properties для данных

## Доступность

- Семантические теги
- Правильная структура
- Поддержка screen readers

## Будущие улучшения

- [ ] Интерактивные точки timeline
- [ ] Клик по точке для детализации
- [ ] Фильтрация по годам
- [ ] Поиск по событиям
- [ ] Анимация появления элементов
- [ ] Видео для каждого события
- [ ] Галерея для каждого события
- [ ] Социальные кнопки
- [ ] Поделиться событием
- [ ] Режим "compact"
