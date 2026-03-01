# Навигация Header (desktop)

Компонент для отображения навигации в header на desktop.

**Расположение**: [`/components/app/header/Nav.vue`](../components/app/header/Nav.vue)

## Обзор

Компонент выполняет следующие функции:
1. Отображение навигационных ссылок
2. Локализация названий разделов
3. Интеграция с корзиной
4. Responsive видимость (только desktop)

## Использование

```vue
<script setup lang="ts">
import AppHeaderNav from '@/components/app/header/Nav.vue'
</script>

<template>
  <AppHeaderNav />
</template>
```

## Функционал

### 1. Навигационные ссылки

| Раздел | URL | Описание |
|---------|-----|----------|
| О художнике | `/` | Главная страница с информацией |
| Календарь | `/calendar` | Календарь событий |
| Выставки | `/exhibitions` | Выставки работ |
| Магазин | `/shop` | Интернет-магазин |

### 2. Корзина

- Ссылка на `/basket`
- Встроенный виджет корзины (`AppBasketWidget`)
- Показ количества товаров

### 3. Локализация

Все названия разделов локализованы через `printLocale()`.

## Структура данных

Нет (компонент использует локализацию).

## UI/UX

### Дизайн

```vue
<nav class="hidden grow lg:block">
  <ul class="flex items-center gap-x-8">
    <!-- Ссылки -->
  </ul>
</nav>
```

### Видимость

```css
.hidden       /* Скрыто на всех устройствах */
.lg\:block    /* Показано на lg и выше */
```

### Ссылки

```vue
<UButton
  color="neutral"
  variant="link"
  to="/path"
  :prefetch="false"
>
  {{ printLocale('header_about') }}
</UButton>
```

### Prefetch

`:prefetch="false"` — отключает prefetch для некоторых страниц:
- Календарь
- Выставки
- Магазин
- Корзина

Это уменьшает начальную загрузку данных.

## Ссылки

```typescript
const links = [
  {
    to: '/',
    label: 'header_about',
    prefetch: true
  },
  {
    to: '/calendar',
    label: 'header_calendar',
    prefetch: false
  },
  {
    to: '/exhibitions',
    label: 'header_exhibition',
    prefetch: false
  },
  {
    to: '/shop',
    label: 'header_shop',
    prefetch: false
  },
  {
    to: '/basket',
    label: 'header_basket',
    component: 'AppBasketWidget',
    prefetch: false
  }
]
```

## Локализация

### useLocales

```typescript
import { useLocales } from '~/composables/useLocales'

const { printLocale } = useLocales()

// Вывод локализованного текста
printLocale('header_about')
```

### Ключи локализации

```typescript
'header_about'       // О художнике
'header_calendar'     // Календарь
'header_exhibition'   // Выставки
'header_shop'        // Магазин
```

## Интеграция с корзиной

```vue
<li>
  <UButton color="neutral" variant="link" to="/basket">
    <AppBasketWidget />
  </UButton>
</li>
```

Виджет корзины встроен в навигацию.

## Примеры использования

### Базовое использование

```vue
<script setup lang="ts">
import AppHeaderNav from '@/components/app/header/Nav.vue'
</script>

<template>
  <AppHeaderNav />
</template>
```

### С кастомными ссылками

```vue
<script setup lang="ts">
const customLinks = [
  { to: '/custom', label: 'header_custom' }
]
</script>

<template>
  <nav class="hidden grow lg:block">
    <ul class="flex items-center gap-x-8">
      <li v-for="link in customLinks" :key="link.to">
        <UButton :to="link.to" variant="link">
          {{ printLocale(link.label) }}
        </UButton>
      </li>
    </ul>
  </nav>
</template>
```

## Адаптивность

- Скрыто на mobile (< lg)
- Показано на desktop (>= lg)
- Flex layout для ссылок

## SEO

- Семантические теги `nav` и `ul`
- Правильные ссылки
- Prefetch для улучшения UX

## Доступность

- Семантическая навигация
- Focus состояния
- ARIA атрибуты
- Поддержка клавиатуры

## Будущие улучшения

- [ ] Dropdown меню
- [ ] Hover подсказки
- [ ] Активное состояние текущей страницы
- [ ] Мегаменю
- [ ] Поиск в навигации
- [ ] Иконки для ссылок
- [ ] Быстрые ссылки (shortcuts)
- [ ] Недавние страницы
- [ ] Избранное в навигации
- [ ] Анимации при наведении
