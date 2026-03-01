# Hero секция "О художнике"

Компонент для отображения hero секции на странице "О художнике".

**Расположение**: [`/components/about/Hero.vue`](../components/about/Hero.vue)

## Обзор

Компонент выполняет следующие функции:
1. Отображение изображения художника
2. Отображение текста о художнике
3. Двухколоночный layout на desktop
4. Локализация заголовка и текста

## Использование

```vue
<script setup lang="ts">
import AboutHero from '@/components/about/Hero.vue'
</script>

<template>
  <AboutHero />
</template>
```

## Функционал

### 1. Изображение

- **Путь**: `/about-hero.webp`
- **Alt**: "Юлия Калашникова"
- **Cover fit** для идеального заполнения
- Скругленные углы

### 2. Текст

- **Заголовок**: `about_hero_title`
- **Описание**: `about_hero_text`
- Поддержка переноса строк (`\n`)

### 3. Layout

- **Mobile**: вертикальный layout
- **Desktop**: двухколоночный layout
- Изображение слева, текст справа

## Структура данных

Нет (компонент использует локализацию).

## UI/UX

### Дизайн

```vue
<section class="container mt-20 mb-20">
  <div class="flex flex-col gap-y-10 sm:flex-row sm:gap-x-15 overflow-auto">
    <!-- Изображение -->
    <img
      src="/about-hero.webp"
      alt="Юлия Калашникова"
      class="h-auto w-full sm:w-1/2 object-cover rounded-lg"
    />
    <!-- Текст -->
    <div>
      <h2 class="text-3xl mb-10">
        {{ printLocale('about_hero_title') }}
      </h2>
      <p class="whitespace-pre-line">
        {{ printLocale('about_hero_text') }}
      </p>
    </div>
  </div>
</section>
```

### Padding

```css
mt-20 mb-20    /* 5rem сверху и снизу */
```

### Gap

```css
gap-y-10        /* Mobile: 2.5rem вертикальный */
sm:gap-x-15    /* Desktop: 3.75rem горизонтальный */
```

### Изображение

```css
h-auto              /* Автоматическая высота */
w-full             /* Полная ширина контейнера */
sm:w-1/2          /* Desktop: половина ширины */
object-cover        /* Заполнение контейнера */
rounded-lg         /* Скругленные углы */
```

### Layout

```css
flex-col            /* Mobile: вертикальный */
sm:flex-row        /* Desktop: горизонтальный */
overflow-auto       /* Overflow для контента */
```

### Текст

```css
.whitespace-pre-line {
  white-space: pre-line;  /* Поддержка \n для переноса строк */
}
```

## Локализация

### useLocales

```typescript
import { useLocales } from '~/composables/useLocales'

const { printLocale } = useLocales()

// Вывод локализованного текста
printLocale('about_hero_title')
printLocale('about_hero_text')
```

### Ключи локализации

```typescript
'about_hero_title'    // Заголовок секции
'about_hero_text'     // Текст о художнике
```

### Поддержка переноса строк

```typescript
// В локализации:
'about_hero_text': 'Первая строка\nВторая строка'

// В компоненте:
<p class="whitespace-pre-line">
  {{ printLocale('about_hero_text') }}
</p>
```

## Примеры использования

### Базовое использование

```vue
<script setup lang="ts">
import AboutHero from '@/components/about/Hero.vue'
</script>

<template>
  <AboutHero />
</template>
```

### С кастомным изображением

```vue
<script setup lang="ts">
const heroImage = '/custom-hero.webp'
</script>

<template>
  <section class="container mt-20 mb-20">
    <div class="flex flex-col gap-y-10 sm:flex-row sm:gap-x-15">
      <img
        :src="heroImage"
        alt="Юлия Калашникова"
        class="h-auto w-full sm:w-1/2 object-cover rounded-lg"
      />
      <div>
        <h2 class="text-3xl mb-10">
          {{ printLocale('about_hero_title') }}
        </h2>
        <p class="whitespace-pre-line">
          {{ printLocale('about_hero_text') }}
        </p>
      </div>
    </div>
  </section>
</template>
```

## Адаптивность

### Mobile (< sm)

```css
flex-col           /* Вертикальный layout */
w-full             /* Изображение на всю ширину */
```

### Desktop (>= sm)

```css
flex-row           /* Горизонтальный layout */
sm:w-1/2          /* Изображение на половину ширины */
```

## SEO

- Alt текст для изображения
- Семантические теги (`section`, `h2`, `p`)
- Правильная структура контента

## Производительность

- Оптимизированный формат WebP для изображения
- Lazy loading (опционально)
- CSS-only layout

## Доступность

- Alt текст для изображения
- Семантические теги
- Читабельный текст с переносами строк
- Поддержка screen readers

## Будущие улучшения

- [ ] Параллакс эффект
- [ ] Фон за секцией
- [ ] Видео вместо изображения
- [ ] Кнопка "Читать далее"
- [ ] Прогресс-бар чтения
- [ ] Цитаты художника
- [ ] Ссылки на соцсети
- [ ] Кнопка "Связаться"
- [ ] Анимация появления
- [ ] Интерактивные элементы
