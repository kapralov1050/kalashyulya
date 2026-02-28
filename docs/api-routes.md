# API Routes

Документация по API эндпоинтам проекта.

## Yandex Cloud Functions

### PDF Certificate Generator

Генерирует PDF сертификат подлинности.

**Endpoint**: `POST https://functions.yandexcloud.net/d4ertp5k9fuh1q4d18ut`

#### Request

```typescript
interface CertificateRequest {
  purchaseDate: string    // ISO дата (например: "2026-02-28T00:00:00.000Z")
  product: {
    id: number
    title: string
    year: string
    tecnic: string
    material: string
    size: string
  }
}
```

#### Response

**Success (200)**:
```
Content-Type: application/pdf
Body: <PDF base64>
```

**Error (400)**:
```json
{
  "error": "Product information is required"
}
```

**Error (500)**:
```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

#### Example

```bash
curl -X POST https://functions.yandexcloud.net/d4ertp5k9fuh1q4d18ut \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseDate": "2026-02-28T00:00:00.000Z",
    "product": {
      "id": 1,
      "title": "Рыбаки в миниатюре",
      "year": "2025",
      "tecnic": "Акварель",
      "material": "Бумага, акварель",
      "size": "23,5*33"
    }
  }' \
  --output certificate.pdf
```

---

### Email Sender

Отправляет email уведомления.

**Endpoint**: `POST https://functions.yandexcloud.net/<email-function-id>`

#### Request

```typescript
interface EmailRequest {
  to: string       // Email получателя
  subject: string  // Тема письма
  html: string     // HTML содержимое
}
```

#### Response

```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "<message-id>"
}
```

#### Error

```json
{
  "success": false,
  "error": "Failed to send email",
  "details": "Error details"
}
```

#### Example

```bash
curl -X POST https://functions.yandexcloud.net/<email-function-id> \
  -H "Content-Type: application/json" \
  -d '{
    "to": "customer@example.com",
    "subject": "Ваш заказ подтверждён",
    "html": "<h1>Спасибо за заказ!</h1>"
  }'
```

---

## Firebase

### Realtime Database

**Используется для**:
- Хранения каталога товаров
- Заказов
- Контента (локали, настройки)

#### Структура данных

```
{
  "products": {
    "1": { Product },
    "2": { Product }
  },
  "orders": {
    "order-id": { Order }
  },
  "content": {
    "locales": { Locales },
    "settings": { Settings }
  }
}
```

#### Правила безопасности (пример)

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "products": {
      ".read": true,
      ".write": "auth != null"
    },
    "orders": {
      ".read": "auth != null && data.child('customerEmail').val() === auth.token.email",
      ".write": "auth != null"
    }
  }
}
```

---

### Firebase Storage

**Используется для**:
- Изображений товаров
- Загруженных файлов

#### Загрузка изображения

```typescript
import { getStorage, ref, uploadBytes } from 'firebase/storage'

const storage = getStorage()
const storageRef = ref(storage, `products/${productId}/image.jpg`)

await uploadBytes(storageRef, file)
```

#### Получение URL

```typescript
import { getDownloadURL } from 'firebase/storage'

const url = await getDownloadURL(storageRef)
```

---

## Типы данных

### Product

```typescript
interface Product {
  id: number
  title: string
  description?: string
  year: string
  tecnic: string
  material: string
  size: string
  price: number
  image: string[]           // URL изображений
  category?: string
  available: boolean
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}
```

### Order

```typescript
interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: OrderItem[]
  subtotal: number
  deliveryCost?: number
  total: number
  paymentMethod: string
  delivery?: {
    method: string
    address: string
    city: string
  }
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  updatedAt: string
}
```

### OrderItem

```typescript
interface OrderItem {
  productId: number
  title: string
  price: number
  quantity: number
}
```

---

## CORS

Все Yandex Cloud Functions поддерживают CORS:

```javascript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

Для продакшена ограничьте `Access-Control-Allow-Origin` доменом вашего сайта.

---

## Ошибки

### Стандартные коды

- **200** — OK
- **400** — Bad Request (неверные данные)
- **500** — Internal Server Error

### Обработка ошибок на клиенте

```typescript
try {
  const response = await fetch(url, { ... })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Unknown error')
  }

  // Успех
} catch (error) {
  console.error('API Error:', error)
  // Показать уведомление пользователю
}
```

---

## Rate Limiting (рекомендация)

Для Yandex Cloud Functions можно настроить лимиты через API Gateway или реализовать на уровне функции.

Пример простой реализации:
```javascript
const rateLimit = new Map() // ip -> { count, resetTime }

exports.handler = async function (event) {
  const ip = event.headers['x-real-ip'] || event.headers['client-ip']

  // Проверка лимита
  const limit = 100 // запросов в час
  // ...
}
```
