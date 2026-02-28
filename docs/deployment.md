# Деплой проекта

Инструкция по развёртыванию проекта Kalashyulya.

## Содержание

1. [Frontend деплой](#frontend-деплой)
2. [Yandex Cloud Functions](#yandex-cloud-functions)
3. [ENV переменные](#env-переменные)

## Frontend деплой

### Подготовка

```bash
# Установка зависимостей
npm install

# Сборка продакшен версии
npm run build

# Генерация статики
npm run generate
```

### Варианты деплоя

#### 1. Yandex Cloud Functions (Static Hosting)

```bash
# Установка Yandex Cloud CLI
curl https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
yc init

# Создание бакета для статики
yc storage bucket create --name kalashyulya-static

# Загрузка статики
yc storage bucket upload --bucket kalashyulya-static --recursive --path .output/
```

#### 2. Yandex Object Storage + CDN

1. Создайте бакет в Object Storage
2. Настройте CDN с бакета как источник
3. Загрузите содержимое `.output/`

#### 3. Vercel / Netlify

```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
vercel
```

#### 4. Собственный сервер (Nginx)

```bash
# Сборка
npm run build

# Копировать на сервер
scp -r .output/* user@server:/var/www/kalashyulya/
```

**Nginx конфигурация**:
```nginx
server {
  listen 80;
  server_name kalashyulya.ru;
  root /var/www/kalashyulya;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Кэширование статики
  location /_nuxt/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

## Yandex Cloud Functions

### 1. PDF Certificate Generator

**Папка**: `/yandex-function`

**Деплой через консоль**:
1. https://console.cloud.yandex.ru/functions
2. Создать функцию `certificate-generator`
3. Загрузить файлы: `index.js`, `package.json`
4. Настроить:
   - Runtime: Node.js 18
   - Memory: 512 MB
   - Timeout: 30s
   - Entrypoint: `index.handler`
5. Создать HTTP-триггер

**Деплой через CLI**:
```bash
yc serverless function version create \
  --function-name=certificate-generator \
  --runtime=nodejs18 \
  --memory=512m \
  --execution-timeout=30s \
  --source-path=./yandex-function \
  --entrypoint=index.handler
```

### 2. Email Sender (почтовая функция)

Аналогично PDF генератору, но с другими ENV переменными.

## ENV переменные

### Frontend (.env)

```bash
# Firebase
NUXT_FIREBASE_API_KEY=...
NUXT_FIREBASE_AUTH_DOMAIN=...
NUXT_FIREBASE_PROJECT_ID=...
NUXT_FIREBASE_STORAGE_BUCKET=...
NUXT_FIREBASE_MESSAGING_SENDER_ID=...
NUXT_FIREBASE_APP_ID=...
NUXT_FIREBASE_MEASUREMENT_ID=...

# Yandex Cloud Functions
NUXT_PUBLIC_CLOUD_FUNCTION_PDF_GENERATOR_URL=https://functions.yandexcloud.net/d4ertp5k9fuh1q4d18ut

# Другие
NUXT_PUBLIC_SITE_URL=https://kalashyulya.ru
```

### Cloud Functions

#### PDF Generator
- Не требует ENV переменных
- Логотип встроен в код как base64

#### Email Sender
```bash
EMAIL_USER=your-email@mail.ru
EMAIL_PASSWORD=your-app-password
```

## Проверка деплоя

### Frontend

```bash
# Проверить сборку локально
npm run build
npm run preview

# Открыть http://localhost:3000
```

### Cloud Functions

```bash
# Тест PDF генератора
curl -X POST https://functions.yandexcloud.net/d4ertp5k9fuh1q4d18ut \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseDate": "2026-02-28T00:00:00.000Z",
    "product": {
      "id": 1,
      "title": "Тест",
      "year": "2025",
      "tecnic": "Акварель",
      "material": "Бумага",
      "size": "30x40"
    }
  }' \
  --output test.pdf
```

## CI/CD (опционально)

### GitHub Actions

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Yandex Cloud
        run: |
          yc storage bucket upload \
            --bucket kalashyulya-static \
            --recursive \
            --path .output/
        env:
          YC_TOKEN: ${{ secrets.YC_TOKEN }}
```

## Мониторинг

### Yandex Cloud Monitoring

1. https://console.cloud.yandex.ru/functions
2. Выбрать функцию
3. Вкладка "Мониторинг"
4. Метрики:
   - Количество вызовов
   - Ошибки
   -Latency
   - Память
   - Время выполнения

### Логи

```bash
# Логи функции
yc serverless function logs certificate-generator

# Логи за последний час
yc serverless function logs certificate-generator --since 1h
```

## Rollback

### Frontend

```bash
# Пересобрать с предыдущего коммита
git checkout <previous-commit>
npm run build
npm run generate

# Задеплоить снова
```

### Cloud Functions

```bash
# Список версий
yc serverless function version list certificate-generator

# Откат на предыдущую версию
yc serverless function version set-by-tag \
  --function-name=certificate-generator \
  --tag=production \
  --version-id=<previous-version-id>
```

## Безопасность

1. **ENV переменные** — никогда не коммитьте `.env` файлы
2. **Firebase** — используйте правила безопасности Realtime Database
3. **CORS** — ограничьте `Access-Control-Allow-Origin` в продакшене
4. **Rate limiting** — настройте лимиты на Cloud Functions
