# Секция "Особенности" (Features)

Компонент для отображения списка особенностей на главной странице.

**Расположение**: [`/components/app/features/index.vue`](../components/app/features/index.vue)

## Обзор

Компонент выполняет следующие функции:
1. Отображение заголовка секции
2. Список особенностей
3. Локализация заголовка и описания

## Использование

```vue
<script setup lang="ts">
import AppFeatures from '@/components/app/features/index.vue'
</script>

<template>
  <AppFeatures />
</template>
```

## Функционал

### 1. Заголовок секции

- Заголовок: `mainpage_featuresTitle`
- Описание: `mainpage_featuresDescription`
- Локализованный текст

### 2. Содержимое

- Отображение списка особенностей
- Использует подкомпонент `AppFeaturesContent`

## Структура данных

Нет (компонент использует подкомпоненты).

## Подкомпоненты

### AppSectionHeader

Заголовок секции с подзаголовком.

### AppFeaturesContent

Содержимое секции с особенностями.

## UI/UX

### Дизайн

```vue
<section
  id="features"
  class="flex flex-col gap-y-8 py-8 sm:gap-y-12 sm:py-16"
>
  <AppSectionHeader
    :heading="printLocale('mainpage_featuresTitle')"
    :subheading="printLocale('mainpage_featuresDescription')"
  />
  <AppFeaturesContent />
</section>
```

### Padding

```css
py-8          /* Mobile: 2rem */
sm:py-16      /* Desktop: 4rem */
```

### Gap

```css
gap-y-8        /* Mobile: 2rem */
sm:gap-y-12    /* Desktop: 3rem */
```

## Локализация

### useLocales

```typescript
import { useLocales } from '~/composables/useLocales'

const { printLocale } = useLocales()

// Вывод локализованного текста
printLocale('mainpage_featuresTitle')
```

### Ключи локализации

```typescript
'mainpage_featuresTitle'        // Заголовок секции
'mainpage_featuresDescription'   // Описание секции
```

## Примеры использования

### Базовое использование

```vue
<script setup lang="ts">
import AppFeatures from '@/components/app/features/index.vue'
</script>

<template>
  <AppFeatures />
</template>
```

### С кастомным ID

```vue
<script setup lang="ts">
const sectionId = 'custom-features'
</script>

<template>
  <section :id="sectionId">
    <AppSectionHeader
      :heading="printLocale('mainpage_featuresTitle')"
      :subheading="printLocale('mainpage_featuresDescription')"
    />
    <AppFeaturesContent />
  </section>
</template>
```

## Адаптивность

- Увеличенный padding на desktop
- Увеличенный gap на desktop
- Flex column layout

## SEO

- ID секции для якорных ссылок
- Семантический тег `section`
- Правильные заголовки

## Доступность

- Семантические теги
- Focus состояния
- ARIA атрибуты

## Будущие улучшения

- [ ] Анимации при скролле
- [ ] Иконки для особенностей
- [ ] Hover эффекты
- [ ] Кастомное содержимое через props
- [ ] Изменение порядка особенностей
- [ ] Избранные особенности
- [ ] Подсветка текущей особенности
- [ ] Видео демонстрации
- [ ] Интерактивные элементы
- [ ] Темная/светлая тема для секции
