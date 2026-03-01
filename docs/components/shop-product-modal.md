# Модальное окно товара

Компонент для отображения детальной информации о товаре в модальном окне.

**Расположение**: [`/components/shop/ProductModal.vue`](../components/shop/ProductModal.vue)

## Обзор

Компонент выполняет следующие функции:
1. Отображение модального окна с детальной информацией
2. Встраивание расширенной карточки товара
3. Управление состоянием открытия/закрытия
4. Кнопка закрытия модального окна

## Использование

```vue
<script setup lang="ts">
import ProductModal from '@/components/shop/ProductModal.vue'
</script>

<template>
  <ProductModal
    :selected-product="selectedProduct"
    :is-product-modal-open="isModalOpen"
    @close="closeModal"
  />
</template>
```

## Функционал

### 1. Модальное окно

- **UModal** компонент от Nuxt UI
- Overlay с backdrop blur
- Адаптивный размер:
  - Min width: 80vw
  - Max height: 70vh
  - Auto height по контенту

### 2. Кнопка закрытия

- Иконка X (heroicons:x-mark-16-solid)
- Абсолютное позиционирование (top-4 right-4)
- Круглая форма с border
- Variant link

### 3. Контент

- Использует `ShopItemExtended` для отображения
- Передает выбранный товар

## Структура данных

### Props

```typescript
interface Props {
  selectedProduct: Product | null   // Выбранный товар
  isProductModalOpen: boolean       // Открыто ли модальное окно
}
```

### Emits

```typescript
interface Emits {
  close: []    // Событие закрытия модального окна
}
```

## Компонент

### Props

```typescript
const props = defineProps<{
  selectedProduct: Product | null
  isProductModalOpen: boolean
}>()
```

### Emits

```typescript
const emit = defineEmits<{
  close: []
}>()
```

### Computed Properties

```typescript
// Управление состоянием модального окна
const isOpen = computed({
  get: () => props.isProductModalOpen,
  set: () => emit('close'),
})
```

## UModal Configuration

```typescript
const modalUI = {
  overlay: 'bg-black/50 backdrop-blur-sm',
  content: 'min-w-[80vw] max-h-[70vh] h-auto shadow-4xl',
}
```

## UI/UX

### Дизайн

- Dark overlay с backdrop blur
- Контент с тенью
- Кнопка закрытия поверх контента
- Адаптивный размер

### Кнопка закрытия

```vue
<UButton
  icon="heroicons:x-mark-16-solid"
  variant="link"
  color="neutral"
  size="lg"
  class="absolute top-4 right-4 z-10000 rounded-full
    text-black dark:text-white border-2 border-black
    dark:border-white hover:text-neutral-500
    hover:border-neutral-500"
  @click="emit('close')"
/>
```

### Стили

```css
/* Z-index для кнопки закрытия */
z-10000

/* Border */
border-2 border-black dark:border-white

/* Hover состояние */
hover:text-neutral-500
hover:border-neutral-500
```

## Поток работы

### Открытие модального окна

```typescript
// 1. Установить выбранный товар
selectedProduct.value = product

// 2. Открыть модальное окно
isProductModalOpen.value = true

// 3. Компонент рендерится
```

### Закрытие модального окна

```typescript
// 1. Клик на кнопку закрытия
emit('close')

// 2. Или изменение prop v-model:open
isOpen.value = false

// 3. Родительский компонент сбрасывает состояние
isProductModalOpen.value = false
selectedProduct.value = null
```

## Интеграция с ShopItemExtended

```vue
<template #content>
  <!-- Кнопка закрытия -->
  <UButton @click="emit('close')" />

  <!-- Расширенная карточка товара -->
  <ShopItemExtended :product="selectedProduct" />
</template>
```

## Примеры использования

### Базовое использование

```vue
<script setup lang="ts">
const isModalOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

function openModal(product: Product) {
  selectedProduct.value = product
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedProduct.value = null
}
</script>

<template>
  <button @click="openModal(product)">Просмотр</button>

  <ProductModal
    :selected-product="selectedProduct"
    :is-product-modal-open="isModalOpen"
    @close="closeModal"
  />
</template>
```

### Использование с v-model

```vue
<script setup lang="ts">
const isModalOpen = ref(false)
const selectedProduct = ref<Product | null>(null)
</script>

<template>
  <ProductModal
    v-model:open="isModalOpen"
    :selected-product="selectedProduct"
    @close="selectedProduct = null"
  />
</template>
```

## Доступность

- Кнопка закрытия с иконкой
- Focus trap (обеспечивается UModal)
- Escape key (обеспечивается UModal)
- ARIA атрибуты (обеспечиваются UModal)

## Типы данных

```typescript
// /types/index.ts
export interface Product {
  id: number
  title: string
  description?: string
  price: number
  image: string[]
  // ... остальные поля
}

interface ProductModalProps {
  selectedProduct: Product | null
  isProductModalOpen: boolean
}

interface ProductModalEmits {
  close: []
}
```

## Особенности

### Двусторонняя привязка

- Использует `computed` для двусторонней привязки
- `get`: возвращает `isProductModalOpen`
- `set`: вызывает `emit('close')`

### Адаптивность

- Min width: 80vw (мобильные устройства)
- Auto width по контенту
- Max height: 70vh
- Auto height

### Стек слоев

- Кнопка закрытия: z-10000
- Overlay: z-50 (по умолчанию UModal)
- Контент: z-50 (по умолчанию UModal)

## Будущие улучшения

- [ ] Анимация открытия/закрытия
- [ ] Drag-to-close на мобильных
- [ ] Клик по overlay для закрытия
- [ ] Предзагрузка изображений
- [ ] Кнопки "Следующий/Предыдущий" для навигации
- [ ] Сохранение состояния скролла при закрытии
- [ ] Шаринг в социальных сетях
- [ ] Добавление в избранное из модального окна
