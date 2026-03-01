# Документация проекта Kalashyulya

Добро пожаловать в документацию проекта галереи Юлии Калашниковой.

## О проекте

Nuxt 3 приложение для интернет-галереи картин с админ-панелью для управления контентом и генерации документов.

## Структура документации

### [Cloud Functions](./cloud-functions.md)
Документация Yandex Cloud Functions:
- **PDF Certificate Generator** — генерация сертификатов подлинности
- Почтовая функция для уведомлений

### [Компоненты](./components/)

#### Dashboard компоненты
- **[Certificate Generator](./components/certificate-generator.md)** — генератор сертификатов подлинности
- **[Locales Form](./components/dashboard-locale-form.md)** — управление локализацией
- **[New Product Form](./components/dashboard-new-product.md)** — создание товаров
- **[Products List](./components/dashboard-products-list.md)** — список товаров с управлением бронью
- **[Orders List](./components/dashboard-orders-list.md)** — управление заказами

#### Shop компоненты
- **[Shop List](./components/shop-list.md)** — список товаров с пагинацией
- **[Shop Item](./components/shop-item.md)** — карточка товара
- **[Shop Item Extended](./components/shop-item-extended.md)** — детальная страница товара
- **[Product Modal](./components/shop-product-modal.md)** — модальное окно товара
- **[Exhibition Card](./components/exhibitions-card.md)** — карточка выставки
- **[Exhibition Gallery](./components/exhibitions-gallery.md)** — галерея работ выставки

#### App компоненты
- **[Basket Widget](./components/app-basket-widget.md)** — виджет корзины
- **[App Header](./components/app-header.md)** — шапка сайта
- **[App Header Nav](./components/app-header-nav.md)** — навигация header
- **[App Footer](./components/app-footer.md)** — подвал сайта
- **[App Features](./components/app-features.md)** — секция особенностей

#### About компоненты
- **[About Gallery](./components/about-gallery.md)** — галерея работ на странице "О художнике"
- **[About Hero](./components/about-hero.md)** — hero секция "О художнике"
- **[About Timeline](./components/about-timeline.md)** — хроника событий

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
