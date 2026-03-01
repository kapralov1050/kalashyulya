# Header (шапка сайта)

Компонент для отображения шапки сайта с навигацией.

**Расположение**: [`/components/app/header/index.vue`](../components/app/header/index.vue)

## Обзор

Компонент выполняет следующие функции:
1. Отображение логотипа сайта
2. Навигация по основным разделам
3. Переключатель темной/светлой темы
4. Мобильная навигация
5. Sticky позиционирование

## Использование

```vue
<script setup lang="ts">
import AppHeader from '@/components/app/header/index.vue'
</script>

<template>
  <AppHeader />
</template>
```

## Функционал

### 1. Логотип

- Отображает логотип сайта
- Размер: xl (mobile), 2xl (desktop)
- Цвет: primary (light), white (dark)

### 2. Навигация

**Desktop** (lg и выше):
- Главная (about)
- Календарь
- Выставки
- Магазин
- Корзина

**Mobile** (ниже lg):
- Мобильное меню (гамбургер)

### 3. Переключатель темы

- Light/Dark mode
- Иконка переключения
- Persist в localStorage

### 4. Sticky header

- Зафиксирован сверху страницы
- Z-index: 10
- Border bottom на desktop

## Структура данных

Нет (компонент собирает подкомпоненты).

## Подкомпоненты

### AppLogo

Отображение логотипа сайта.

### AppHeaderNav

Навигация для desktop.

### AppHeaderMobileNav

Навигация для mobile.

### AppHeaderThemeSwitch

Переключатель темы.

## UI/UX

### Дизайн

```vue
<header
  class="sticky top-0 inset-x-0 z-10 bg-white
    border-b border-neutral-200 py-2 sm:border-0
    sm:py-4 dark:bg-neutral-900 dark:border-b
    dark:border-neutral-700"
>
```

### Позиционирование

- `sticky top-0` — зафиксирован сверху
- `z-10` — поверх контента
- `inset-x-0` — на всю ширину экрана

### Стили

```css
/* Light mode */
bg-white
border-b border-neutral-200
py-2 (mobile)
py-4 (desktop)

/* Dark mode */
dark:bg-neutral-900
dark:border-b dark:border-neutral-700
```

### Компоновка

```vue
<div class="container flex items-center gap-x-5">
  <AppLogo class="text-xl sm:text-2xl" />
  <AppHeaderThemeSwitch class="ml-auto" />
  <AppHeaderNav />
  <AppHeaderMobileNav />
</div>
```

## Desktop навигация

Ссылки:
- `/` — О художнике
- `/calendar` — Календарь
- `/exhibitions` — Выставки
- `/shop` — Магазин
- `/basket` — Корзина

## Mobile навигация

Гамбургер-меню для устройств меньше lg.

## Переключатель темы

- Light/Dark mode
- Сохранение предпочтений
- Автоматическое переключение системной темы

## Примеры использования

### Базовое использование

```vue
<script setup lang="ts">
import AppHeader from '@/components/app/header/index.vue'
</script>

<template>
  <AppHeader />
</template>
```

### С кастомным логотипом

```vue
<script setup lang="ts">
const logoClasses = 'text-3xl custom-logo-classes'
</script>

<template>
  <AppHeader>
    <AppLogo :class="logoClasses" />
  </AppHeader>
</template>
```

## Адаптивность

### Mobile (< lg)

- Уменьшенный padding
- Мобильное меню
- Уменьшенный логотип

### Desktop (>= lg)

- Увеличенный padding
- Desktop навигация
- Увеличенный логотип

## SEO

- Семантический тег `<header>`
- Правильная навигация
- Alt тексты для логотипа

## Доступность

- Семантическая навигация
- Focus состояния
- ARIA атрибуты
- Поддержка клавиатуры

## Будущие улучшения

- [ ] Поиск в header
- [ ] Выбор языка
- [ ] Кнопка "Войти/Регистрация"
- [ ] Уведомления
- [ ] Прогресс загрузки
- [ ] Breadcrumbs
- [ ] Меню профиля
- [ ] Социальные иконки
- [ ] Кнопка "В избранное"
- [ ] Подписка на новости
