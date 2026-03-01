# Виджет корзины

Компонент для отображения количества товаров в корзине в header.

**Расположение**: [`/components/app/BasketWidget.vue`](../components/app/BasketWidget.vue)

**Store**: [`/stores/basket.ts`](../stores/basket.ts)

## Обзор

Компонент выполняет следующие функции:
1. Отображение иконки корзины
2. Показ количества товаров в корзине
3. Автоматическое обновление при изменении количества

## Использование

```vue
<script setup lang="ts">
import AppBasketWidget from '@/components/app/BasketWidget.vue'
</script>

<template>
  <AppBasketWidget />
</template>
```

## Функционал

### 1. Отображение иконки корзины

- **Heroicon**: `shopping-cart`
- Размер: `2rem`
- Цвет: нейтральный

### 2. Отображение количества

- Круглый бейдж с количеством
- Позиция: справа сверху от иконки
- Цвет: `bg-primary-500`
- Текст: белый, жирный

## Структура данных

### State

Нет (использует store).

## Store Integration

Использует `useBasketStore()`:

```typescript
import { useBasketStore } from '~/stores/basket'

const { totalPurchaceQty } = storeToRefs(useBasketStore())

// Общее количество товаров в корзине
totalPurchaceQty: ComputedRef<number>
```

## UI/UX

### Дизайн

- Flex layout
- Иконка корзины
- Круглый бейдж с количеством

### Количество товаров

```vue
<div v-if="totalPurchaceQty > 0">
  <span class="bg-primary-500 rounded-full size-5">
    {{ totalPurchaceQty }}
  </span>
</div>
```

Бейдж отображается только если есть товары.

### Иконка корзины

```vue
<div class="flex">
  <UIcon name="heroicons:shopping-cart" size="2rem" />
  <!-- Бейдж с количеством -->
</div>
```

## Примеры использования

### Базовое использование

```vue
<script setup lang="ts">
// Автоматическое обновление из store
const { totalPurchaceQty } = storeToRefs(useBasketStore())
</script>

<template>
  <AppBasketWidget />
</template>
```

### Ссылка на корзину

Обычно используется внутри ссылки на страницу корзины:

```vue
<UButton color="neutral" variant="link" to="/basket">
  <AppBasketWidget />
</UButton>
```

## Типы данных

```typescript
// /stores/basket.ts
export interface BasketState {
  shoppingCart: Purchase[]
  totalPurchase: ComputedRef<number>
  totalPurchaceQty: ComputedRef<number>
}

interface Purchase {
  amount: number
  item: Product
}
```

## Особенности

### Автоматическое обновление

- Использует ComputedRef из store
- Автоматически обновляется при изменении корзины
- Не требует ручного обновления

### Условное отображение

- Бейдж отображается только если `totalPurchaceQty > 0`
- Иконка всегда отображается

### Адаптивность

- Размер иконки: 2rem
- Размер бейджа: 5 (size-5)
- Центрирование содержимого

## Будущие улучшения

- [ ] Анимация при добавлении товара
- [ ] Пульсация бейджа
- [ ] Стоимость товаров в бейдже
- [ ] Dropdown с мини-корзиной
- [ ] Быстрый просмотр товаров
- [ ] Уведомления при изменении
- [ ] Аудио сигнал при добавлении
- [ ] Vibrations на мобильных
