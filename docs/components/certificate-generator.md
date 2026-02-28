# Генератор сертификатов подлинности

Компонент админ-панели для генерации PDF сертификатов подлинности произведений искусства.

**Расположение**: [`/components/dashboard/CertificateGenerator.vue`](../components/dashboard/CertificateGenerator.vue)

**Composable**: [`/composables/usePdfGenerator.ts`](../composables/usePdfGenerator.ts)

## Обзор

Компонент позволяет администратору:
1. Выбрать картину из каталога
2. Указать дату покупки
3. Сгенерировать и скачать PDF сертификат

## Использование

```vue
<script setup lang="ts">
import CertificateGenerator from '@/components/dashboard/CertificateGenerator.vue'
</script>

<template>
  <CertificateGenerator />
</template>
```

## Функционал

### 1. Выбор картины

- **Поиск** по названию картины
- **Селект** с полным списком картин
- **Галерея** с превью изображений для визуального выбора

Данные берутся из `shopStore` (Pinia).

### 2. Дата покупки

- Поле `input type="date"`
- Если не указана — используется текущая дата
- Форматируется в ISO для отправки на backend

### 3. Генерация PDF

При нажатии "Скачать сертификат":
1. Данные отправляются в Yandex Cloud Function
2. Генерируется PDF с сертификатом
3. Файл автоматически скачивается

## Структура данных

### Входные данные (отправляются в cloud function)

```typescript
interface CertificateRequest {
  purchaseDate: string    // ISO дата
  product: {
    id: number
    title: string         // Название картины
    year: string          // Год создания
    tecnic: string        // Техника (акварель, масло и т.д.)
    material: string      // Материалы
    size: string          // Размер
  }
}
```

### Ответ

PDF файл в формате base64 → Blob → скачивание.

## Компонент

### Props

Нет (использует внутреннее состояние).

### State

```typescript
interface State {
  searchQuery: string              // Поисковый запрос
  selectedProductId: number | string  // ID выбранной картины
  purchaseDate: string             // Дата покупки
  isGenerating: boolean            // Флаг генерации
  message: { type, text } | null   // Сообщение об успехе/ошибке
}
```

### Composables

Использует `usePdfGenerator()`:

```typescript
const { generateCertificate } = usePdfGenerator()

// Генерация PDF
await generateCertificate(product, purchaseDate)
```

## PDF Сертификат

### Содержимое

Сертификат включает:
- **Номер сертификата** — автогенерация (формат: `Х-ГОД-###`)
- **Дата оформления** — формат "28 февраля 2026"
- **Информация о произведении**:
  - Название работы
  - Год создания
  - Техника
  - Материалы
  - Размер (без рамы)
  - Описание подписи
- **Раздел "Подлинность"**:
  - Создано автором лично
  - Не является копией
- **Подпись автора** — Юлия Калашникова

### Дизайн

- **Шрифт**: Cormorant Garamond (Google Fonts)
- **Цветовая схема**: бежевый/коричневый HSL
- **Формат**: A4 (210×297mm)
- **Масштабирование**: 0.88 для влезания на один лист
- **Логотип**: встроен как base64 SVG

### HTML шаблон

Находится в [`/yandex-function/index.js`](../yandex-function/index.js) в функции `generateHtmlTemplate()`.

## Cloud Function

### Endpoint

```
POST https://functions.yandexcloud.net/d4ertp5k9fuh1q4d18ut
```

### CORS

Функция поддерживает CORS для браузерных запросов:
- `Access-Control-Allow-Origin: *`
- Обрабатывает OPTIONS preflight запросы

### Ограничения

- **Memory**: 512 MB минимум
- **Timeout**: 30 секунд
- **Размер PDF**: ~100-200 KB

## Интеграция с админ-панелью

Компонент добавлен в [`/pages/admin/dashboard.vue`](../pages/admin/dashboard.vue):

```typescript
const dashboardModals: Record<DashBoardOption, Component> = {
  // ...
  CertificateGenerator: defineAsyncComponent(
    () => import('@/components/dashboard/CertificateGenerator.vue'),
  ),
}
```

Доступен в селекторе модулей как "Генератор сертификатов".

## Типы

```typescript
// /types/index.ts
export type DashBoardOption =
  | 'NewProductForm'
  | 'ProductsList'
  | 'LocalesForm'
  | 'OrdersList'
  | 'StatsDashboard'
  | 'CertificateGenerator'  // ← наш компонент
```

## Будущие улучшения

- [ ] Предпросмотр PDF перед скачиванием
- [ ] Сохранение истории сгенерированных сертификатов
- [ ] Массовая генерация для нескольких картин
- [ ] Кастомизация номера сертификата
