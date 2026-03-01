# Форма управления локализацией

Компонент админ-панели для управления многоязычным контентом.

**Расположение**: [`/components/dashboard/LocalesForm.vue`](../components/dashboard/LocalesForm.vue)

**Store**: [`/stores/locales.ts`](../stores/locales.ts)

## Обзор

Компонент позволяет администратору:
1. Просматривать все локализованные строки (ключ-значение)
2. Редактировать значения локализаций
3. Добавлять новые локализованные строки
4. Удалять локализованные строки
5. Искать по ключам

## Использование

```vue
<script setup lang="ts">
import LocalesForm from '@/components/dashboard/LocalesForm.vue'
</script>

<template>
  <LocalesForm />
</template>
```

## Функционал

### 1. Отображение локализаций

- **Таблица** с пагинацией (страницами)
- **Фильтрация** по поисковому запросу
- **Редактирование** inline для значений
- **Удаление** с подтверждением

### 2. Поиск

- Поле ввода для фильтрации по ключам
- Case-insensitive поиск
- Мгновенная фильтрация списка

### 3. Редактирование

- Inline редактирование при нажатии на иконку карандаша
- Сохранение по Enter или кнопке "Save"
- Отмена редактирования при потере фокуса

### 4. Добавление новой локали

- Поля для ввода ключа и значения
- Валидация на пустые поля
- Проверка на дубликаты ключей
- Мгновенное добавление в список

## Структура данных

### Locale

```typescript
interface Locale {
  [key: string]: string  // Ключ → Значение
}
```

Примеры ключей:
- `shop_filtersTitle` — заголовок фильтров магазина
- `shop_filters_pictures` — категория "Картины"
- `about_section_title` — заголовок раздела "О художнике"

## Компонент

### Props

Нет (использует внутреннее состояние).

### State

```typescript
interface State {
  searchQuery: string        // Поисковый запрос
  editedKey: string          // К редактированию ключ
  editedValue: string        // Значение для редактирования
  newLocale: {
    key: string              // Ключ новой локали
    value: string            // Значение новой локали
  }
}
```

### Computed Properties

```typescript
// Фильтрованные локали по поисковому запросу
filteredLocales: Record<string, string>
```

### Methods

```typescript
// Редактирование локали
editLocale(key: string, value: string): void

// Сохранение изменений
saveChanges(): Promise<void>

// Добавление новой локали
addNewLocale(): Promise<void>
```

## Store Integration

Использует `useLocalesStore()`:

```typescript
import { useLocalesStore } from '~/stores/locales'

const store = useLocalesStore()

// Получение всех локализаций
store.locales

// Обновление локализаций
await store.updateLocales(updatedLocales)

// Удаление локали
await store.deleteLocale(key)
```

## Firebase Integration

Данные хранятся в Firebase Realtime Database по пути `content/locales`.

## Интеграция с админ-панелью

Компонент добавлен в [`/pages/admin/dashboard.vue`](../pages/admin/dashboard.vue):

```typescript
const dashboardModals: Record<DashBoardOption, Component> = {
  LocalesForm: defineAsyncComponent(
    () => import('@/components/dashboard/LocalesForm.vue'),
  ),
}
```

Доступен в селекторе модулей как "Локали".

## Безопасность

- Валидация на пустые поля при добавлении
- Проверка на дубликаты ключей
- Подтверждение удаления (alert)

## UI/UX

### Дизайн

- Сетка с карточками для каждой локали
- Hover эффекты для интерактивных элементов
- Иконки для действий (редактирование, удаление)
- Цветовая кодировка:
  - Gray-50 hover для строк
  - Primary кнопки для основных действий
  - Error кнопки для удаления

### Взаимодействие

- Inline редактирование без перезагрузки
- Мгновенный поиск
- Enter для сохранения изменений
- Иконки действий вместо текстовых кнопок

## Примеры использования

### Добавление новой локали

```javascript
// Заполнение формы
newLocale.value.key = 'shop_newCategory'
newLocale.value.value = 'Новая категория'

// Нажатие на кнопку Add
await addNewLocale()
```

### Редактирование существующей локали

```javascript
// Нажатие на иконку редактирования
editLocale('shop_filtersTitle', 'Фильтры товаров')

// Изменение значения
editedValue.value = 'Каталог товаров'

// Сохранение
await saveChanges()
```

### Поиск по локализациям

```javascript
// Ввод поискового запроса
searchQuery.value = 'shop_filters'

// Автоматическая фильтрация списка
// Будут показаны только локали, содержащие "shop_filters" в ключе
```

## Типы данных

```typescript
// /stores/locales.ts
interface LocalesState {
  locales: Record<string, string> | null
}

// /types/index.ts
export type DashBoardOption = 'LocalesForm'
```

## Особенности

### Редактирование

- Только значения можно редактировать
- Ключи неизменяемы (для сохранения ссылок в коде)
- Inline редактирование для быстрого обновления

### Валидация

- Пустые поля не допускаются
- Дубликаты ключей не допускаются
- Предупреждения через `alert()`

### Производительность

- Мгновенная фильтрация с `computed`
- Асинхронное сохранение в Firebase
- Оптимистичное обновление UI

## Будущие улучшения

- [ ] Редактирование ключей (с обновлением ссылок)
- [ ] Импорт/экспорт локализаций в JSON
- [ ] История изменений локализаций
- [ ] Валидация на использование ключей в коде
- [ ] Поддержка множественных значений (например, переменные)
- [ ] Поиск по значениям, не только по ключам
- [ ] Группировка по категориям/префиксам
