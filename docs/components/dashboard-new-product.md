# Форма создания нового товара

Компонент админ-панели для добавления новых товаров в каталог магазина.

**Расположение**: [`/components/dashboard/NewProductForm.vue`](../components/dashboard/NewProductForm.vue)

**Composable**: [`/composables/firebase/useFirebase.ts`](../composables/firebase/useFirebase.ts)

**Composable**: [`/composables/useYandexDatabase.ts`](../composables/useYandexDatabase.ts)

## Обзор

Компонент позволяет администратору:
1. Создавать новые товары для магазина
2. Указывать категорию товара
3. Загружать изображения товара
4. Настраивать параметры оформления (рама, паспарту)
5. Указывать теги для фильтрации

## Использование

```vue
<script setup lang="ts">
import NewProductForm from '@/components/dashboard/NewProductForm.vue'
</script>

<template>
  <NewProductForm />
</template>
```

## Функционал

### 1. Выбор категории

- **Категории**: Картины, Эскизы, Открытки, Стикеры, Календари
- Опциональное оформление для картин и эскизов:
  - В раме
  - В паспарту

### 2. Основные поля формы

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| Название | text | Да | Название товара |
| Описание | textarea | Нет | Подробное описание |
| Размер | textarea | Да | Размер произведения |
| Материалы | textarea | Да | Использованные материалы |
| Техника | textarea | Да | Техника исполнения |
| Год | text | Да | Год создания |
| Цена | text | Да | Стоимость в рублях |
| Количество | text | Да | Товар на складе |
| Теги | tags | Нет | Для фильтрации |

### 3. Загрузка изображений

- **Multiple upload** — можно загрузить несколько изображений
- Файлы сохраняются в Yandex Storage
- Автоматическая генерация путей и имен файлов
- Поддержка всех форматов изображений

### 4. Оформление (опционально)

Доступно только для категорий "Картины" и "Эскизы":

```typescript
type FramingType = 'frame' | 'passepartout'

const framingOptions = [
  { value: 'frame', label: 'В раме' },
  { value: 'passepartout', label: 'В паспарту' }
]
```

## Структура данных

### Product (сохраняется в Firebase)

```typescript
interface Product {
  id: number                      // Автогенерируется
  categoryId: string              // Категория товара
  title: string                  // Название
  description?: string            // Описание (опционально)
  size: string                   // Размер
  material: string               // Материалы
  tecnic: string                 // Техника
  year: string                   // Год
  price: number                  // Цена
  stock: number                  // Количество на складе
  tags: string[]                 // Теги для фильтрации
  image: string[]                // URL изображений
  file: string[]                 // Имена файлов
  framing?: FramingType[]        // Оформление (опционально)
  isReserved?: boolean           // Статус брони (по умолчанию false)
  createdAt?: string             // Дата создания
  updatedAt?: string             // Дата обновления
}
```

### Request при создании

```typescript
interface CreateProductRequest {
  categoryId: string
  description: string
  size: string
  material: string
  tecnic: string
  year: string
  image: string[]
  file: string[]
  price: number
  stock: number
  tags: string[]
  title: string
  framing?: FramingType[]
}
```

## Компонент

### Props

Нет (используется для создания новых товаров).

### State

```typescript
interface State {
  formData: {
    category: string              // Выбранная категория
    description: string           // Описание
    size: string                 // Размер
    material: string             // Материалы
    tecnic: string               // Техника
    year: string                 // Год
    price: string                // Цена (string для input)
    stock: string                // Количество (string для input)
    imageUrl: string              // (не используется)
    tags: string[]               // Теги
    title: string                // Название
    framing: FramingType[]       // Оформление
  }
  fileInput: File[] | undefined  // Загруженные файлы
}
```

### Constants

```typescript
// /constants/products.ts
enum ProductCategory {
  PICTURES = 'pictures',        // Картины
  SKETCHES = 'sketches',        // Эскизы
  POSTCARDS = 'postcards',      // Открытки
  STICKERS = 'stickers',        // Стикеры
  CALENDARS = 'calendars'       // Календари
}

enum FramingType {
  FRAME = 'frame',               // В раме
  PASSEPARTOUT = 'passepartout' // В паспарту
}
```

### Methods

```typescript
// Создание нового товара
async createProduct(): Promise<void>
```

## Работа с файлами

### Загрузка в Yandex Storage

```typescript
const { uploadToMountedBucket } = useYandexDatabase()

// Загрузка файлов
const promises = fileInput.value.map(async file => {
  const response = await uploadToMountedBucket(file)
  if (response) {
    imageUrl.push(response.path)     // URL для отображения
    fileName.push(response.fileName) // Имя файла для базы
  }
})

await Promise.all(promises)
```

### Сохранение в Firebase

```typescript
const { addNewProduct } = useFirebase()

await addNewProduct(newProduct, 'shop/products/')
```

## Firebase Integration

### Путь в базе данных

```
shop/products/product_{id}
```

### Структура данных

```json
{
  "product_1": {
    "categoryId": "pictures",
    "title": "Рыбаки в миниатюре",
    "description": "...",
    "size": "23,5*33",
    "material": "Бумага, акварель",
    "tecnic": "Акварель",
    "year": "2025",
    "price": 15000,
    "stock": 1,
    "tags": ["акварель", "миниатюра", "рыбаки"],
    "image": ["https://.../image1.jpg"],
    "file": ["image1.jpg"],
    "framing": ["frame", "passepartout"],
    "isReserved": false
  }
}
```

## Интеграция с админ-панелью

Компонент добавлен в [`/pages/admin/dashboard.vue`](../pages/admin/dashboard.vue):

```typescript
const dashboardModals: Record<DashBoardOption, Component> = {
  NewProductForm: defineAsyncComponent(
    () => import('@/components/dashboard/NewProductForm.vue'),
  ),
}
```

Доступен в селекторе модулей как "Добавление товара".

## UI/UX

### Дизайн

- Vertical layout формы
- Tailwind CSS для стилизации
- Поддержка темной/светлой темы
- Широкие поля ввода (w-70% sm:w-96)
- Четкие метки для каждого поля

### Взаимодействие

- Inline checkbox для оформления
- Tags input для тегов (Enter для добавления)
- Multiple file upload с превью
- Loading state на кнопке отправки
- Toast уведомления о результате

### Сообщения об ошибках

```typescript
// При успехе
showToast(
  'success',
  'Product created successfully',
  'heroicons:check-circle'
)

// При ошибке
showToast(
  'error',
  error as string,
  'heroicons:exclamation-circle'
)
```

## Поток создания товара

### Шаг 1: Выбор категории
```
Выбрать категорию из списка → Появляется поле оформления (для картин/эскизов)
```

### Шаг 2: Заполнение формы
```
Заполнить обязательные поля (название, размер, материалы, техника, год, цена, количество)
→ Добавить теги по желанию
→ Загрузить изображения
```

### Шаг 3: Отправка
```
Нажать "Отправить" →
Загрузка файлов в Yandex Storage →
Сохранение данных в Firebase →
Показать уведомление →
Очистить форму
```

## Примеры использования

### Создание картины с оформлением

```javascript
formData.value.category = ProductCategory.PICTURES
formData.value.title = 'Натюрморт с яблоками'
formData.value.size = '50*70'
formData.value.material = 'Холст, масло'
formData.value.tecnic = 'Масло'
formData.value.year = '2026'
formData.value.price = '25000'
formData.value.stock = '1'
formData.value.tags = ['натюрморт', 'масло', 'фрукты']
formData.value.framing = ['frame']

// Загрузка файлов
fileInput.value = [file1, file2]

await createProduct()
```

### Создание открытки

```javascript
formData.value.category = ProductCategory.POSTCARDS
formData.value.title = 'Открытка с пейзажем'
formData.value.size = '15*21'
formData.value.material = 'Бумага'
formData.value.tecnic = 'Печать'
formData.value.year = '2026'
formData.value.price = '500'
formData.value.stock = '100'
formData.value.tags = ['открытка', 'пейзаж']

// Оформление недоступно для открыток

await createProduct()
```

## Валидация

### Клиентская валидация

- Обязательные поля проверяются UI (обозначены label)
- Числовые поля (цена, количество) конвертируются при отправке
- Файлы проверяются при загрузке (размер, тип)

### Серверная валидация

Firebase валидирует структуру данных при сохранении.

## Типы данных

```typescript
// /types/index.ts
export interface Product {
  id: number
  categoryId: string
  title: string
  description?: string
  size: string
  material: string
  tecnic: string
  year: string
  price: number
  stock: number
  tags: string[]
  image: string[]
  file: string[]
  framing?: FramingType[]
  isReserved?: boolean
  createdAt?: string
  updatedAt?: string
}

export type DashBoardOption = 'NewProductForm'
```

## Будущие улучшения

- [ ] Предпросмотр товара перед созданием
- [ ] Автоматическая генерация slug из названия
- [ ] Валидация размера файлов на клиенте
- [ ] Drag & drop загрузка изображений
- [ ] Редактирование существующих товаров
- [ ] Клонирование товара
- [ ] Импорт товаров из CSV/Excel
- [ ] Автоматическая генерация описания на основе данных
