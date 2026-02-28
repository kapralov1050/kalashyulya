# Yandex Cloud Functions

Обзор серверless функций на Yandex Cloud, используемых в проекте.

## Список функций

### 1. PDF Certificate Generator

**Назначение**: Генерация PDF сертификатов подлинности для произведений искусства.

**URL**: `https://functions.yandexcloud.net/d4ertp5k9fuh1q4d18ut`

**Технологии**:
- Node.js 18
- Puppeteer + @sparticuz/chromium (для headless рендеринга PDF)

**Используется в**:
- Админ-панель → Генератор сертификатов

#### API

**Endpoint**: `POST /`

**Request**:
```typescript
interface CertificateRequest {
  purchaseDate: string    // ISO дата покупки (например "2026-02-28T00:00:00.000Z")
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

**Response**: `Buffer` (PDF файл в base64)

**CORS**: Поддерживает preflight запросы (OPTIONS)

#### Особенности

- Масштабирование `scale: 0.88` для влезания контента на A4
- Формат страницы A4 без отступов
- Автоматическая генерация номера сертификата и номера в каталоге
- Логотип встроен как base64

#### Ресурсы

- **Memory**: минимум 512 MB
- **Timeout**: 30 секунд
- **Runtime**: Node.js 18

Подробнее: [`/yandex-function/README.md`](../yandex-function/README.md)

---

### 2. Email Sender (почтовая функция)

**Назначение**: Отправка email уведомлений (заказы, статусы).

**Технологии**:
- Node.js 18
- Nodemailer
- Mail.ru SMTP

**Используется в**:
- Форма заказа
- Уведомления о смене статуса заказа

#### API

**Endpoint**: `POST /`

**Request**:
```typescript
interface EmailRequest {
  to: string          // Email получателя
  subject: string     // Тема письма
  html: string        // HTML содержимое
}
```

**Response**:
```typescript
{
  success: true
  messageId: string   // ID отправленного письма
}
```

#### ENV переменные

- `EMAIL_USER` — логин почты
- `EMAIL_PASSWORD` — пароль приложения

---

## Деплой функций

### Через CLI

```bash
# Создание функции
yc serverless function create --name=pdf-generator

# Создание версии
yc serverless function version create \
  --function-name=pdf-generator \
  --runtime=nodejs18 \
  --memory=512m \
  --execution-timeout=30s \
  --source-path=./yandex-function \
  --entrypoint=index.handler
```

### Через консоль Yandex Cloud

1. https://console.cloud.yandex.ru/functions
2. Создать функцию
3. Загрузить файлы из `/yandex-function`
4. Настроить:
   - Runtime: Node.js 18
   - Memory: 512 MB
   - Timeout: 30s
   - Entrypoint: `index.handler`

## Troubleshooting

### "No sandbox" ошибка

Добавить аргументы Chromium:
```javascript
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
]
```

### Timeout

Увеличить timeout до 60 секунд в настройках функции.

### Не хватает памяти

Увеличить memory до 1GB для PDF генерации.
