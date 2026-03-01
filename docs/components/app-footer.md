# Footer (подвал сайта)

Компонент для отображения подвала сайта с ссылками.

**Расположение**: [`/components/app/footer/index.vue`](../components/app/footer/index.vue)

## Обзор

Компонент выполняет следующие функции:
1. Отображение ссылок и контактов
2. Gradient фон
3. Border top для разделения
4. Dark mode поддержка

## Использование

```vue
<script setup lang="ts">
import AppFooter from '@/components/app/footer/index.vue'
</script>

<template>
  <AppFooter />
</template>
```

## Функционал

### 1. Отображение ссылок

- Ссылки на основные разделы
- Контактная информация
- Социальные сети

### 2. Стилизация

- Gradient фон
- Border top
- Padding для контента
- Dark mode поддержка

## Структура данных

Нет (компонент использует подкомпонент).

## Подкомпоненты

### AppFooterLinks

Отображение ссылок и контактов.

## UI/UX

### Дизайн

```vue
<footer
  class="mt-auto bg-gradient-to-br from-neutral-50 to-neutral-100
    dark:from-neutral-900 dark:to-neutral-800 border-t
    border-neutral-200 dark:border-neutral-700"
>
  <div class="container mx-auto px-6 py-5">
    <AppFooterLinks />
  </div>
</footer>
```

### Gradient

```css
/* Light mode */
bg-gradient-to-br from-neutral-50 to-neutral-100

/* Dark mode */
dark:from-neutral-900 dark:to-neutral-800
```

### Border

```css
border-t border-neutral-200
dark:border-neutral-700
```

### Позиционирование

- `mt-auto` — прижимает к низу контейнера
- `container` — ограничивает ширину
- `mx-auto` — центрирует по горизонтали

### Padding

```css
px-6 py-5
```

## AppFooterLinks

Содержит ссылки на:
- О художнике
- Магазин
- Выставки
- Контакты
- Социальные сети

## Примеры использования

### Базовое использование

```vue
<script setup lang="ts">
import AppFooter from '@/components/app/footer/index.vue'
</script>

<template>
  <AppFooter />
</template>
```

### С кастомным контентом

```vue
<script setup lang="ts">
const customFooterClasses = 'py-10'
</script>

<template>
  <AppFooter :class="customFooterClasses">
    <AppFooterLinks />
    <CustomFooterContent />
  </AppFooter>
</template>
```

## Адаптивность

- Container с max-width
- Адаптивный padding
- Flex layout для ссылок

## SEO

- Семантический тег `<footer>`
- Правильные ссылки
- Атрибуты rel для внешних ссылок

## Доступность

- Семантические теги
- Focus состояния
- ARIA атрибуты
- Поддержка клавиатуры

## Будущие улучшения

- [ ] Форма подписки на новости
- [ ] Кнопка "Наверх"
- [ ] Год в copyright
- [ ] QR код для мобильных
- [ ] Карта проезда
- [ ] Реквизиты компании
- [ ] Информация о доставке
- [ ] Политика конфиденциальности
- [ ] Условия использования
- [ ] Социальные кнопки с иконками
