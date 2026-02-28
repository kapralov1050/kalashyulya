# Документация проекта Kalashyulya

Добро пожаловать в документацию проекта галереи Юлии Калашниковой.

## О проекте

Nuxt 3 приложение для интернет-галереи картин с админ-панелью для управления контентом и генерации документов.

## Структура документации

### [Cloud Functions](./cloud-functions.md)
Документация Yandex Cloud Functions:
- **PDF Certificate Generator** — генерация сертификатов подлинности
- Почтовая функция для уведомлений

### [Компоненты админки](./components/)
- **[Certificate Generator](./components/certificate-generator.md)** — генератор сертификатов подлинности

## Основные технологии

- **Frontend**: Nuxt 3, Vue 3, TypeScript
- **UI**: Tailwind CSS
- **State**: Pinia
- **Backend**: Firebase
- **Serverless**: Yandex Cloud Functions
- **PDF Generation**: Puppeteer, @sparticuz/chromium

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build
```

## ENV переменные

См. `.env.example` в корне проекта.

Основные переменные:
- `NUXT_PUBLIC_*` — публичные переменные (доступны на клиенте)
- Firebase конфигурация
- URL Yandex Cloud Functions

## Структура проекта

```
├── components/          # Vue компоненты
│   ├── dashboard/      # Админ-панель
│   └── shop/           # Магазин
├── composables/        # Composables (переиспользуемая логика)
├── pages/              # Страницы и маршруты
├── stores/             # Pinia сторы
├── types/              # TypeScript типы
├── yandex-function/    # Yandex Cloud Functions
└── docs/               # Документация (этот файл)
```

## Полезные ссылки

- [Nuxt 3 Documentation](https://nuxt.com)
- [Vue 3 Documentation](https://vuejs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Yandex Cloud Functions](https://cloud.yandex.ru/docs/functions/)
