# AGENTS.md

> Справка по проекту kalashyulya.ru — персональный сайт художника Юлии Калашниковой (акварель, уроки, мастер-классы, мерч).

Основные ссылки:
- [Архитектура и организация кода](./docs/architecture.md)
- [Данные и stores](./docs/data-and-stores.md)
- [Checkout-фича и платежи](./docs/checkout-flow.md)
- [Tooling и конвенции](./docs/tooling-and-conventions.md)
- [Переменные окружения](./docs/environment.md)

---

## Технологии

| Слой | Технологии |
|------|-----------|
| Framework | Nuxt 4 (SPA-режим, `ssr: false`) |
| UI | @nuxt/ui v3 + Tailwind CSS v4 |
| State | Pinia |
| Backend | Firebase RTDB, Firebase Auth, Firebase Storage |
| Платежи | YooKassa |
| Анимации | GSAP + ScrollTrigger, Lenis (smooth scroll) |
| Карты | SVG-карта России (`RussiaMap.vue`), DaData API |
| i18n | @nuxtjs/i18n, динамические локали из JSON |
| CI/CD | GitHub Actions → FTP-деплой на prod |

---

## Структура кода

```
app/
├── components/          # Vue-компоненты
│   ├── about/           # Секции главной страницы
│   ├── app/             # Переиспользуемые (header, footer, hero…)
│   ├── dashboard/       # Админка (управление товарами, заказами, выставками)
│   ├── exhibitions/     # Карточки и галерея выставок
│   ├── playlist/        # Плейлисты уроков
│   ├── shop/            # Каталог, карточки, чекаут
│   └── tag/             # Теги
├── composables/         # Vue-композаблы (логика)
├── features/
│   └── checkout/        # Feature-slice чекаута (steps, store, validation)
├── layouts/             # default, auth
├── pages/               # Роуты (/, /shop, /admin, /exhibitions…)
├── stores/              # Pinia-stores
├── helpers/             # Firebase-хелперы, валидация (Valibot)
├── utils/               # Метрики, форматтеры, тестовые утилиты
├── composables/         # useShop, useFirebase, useLocales, useSeo…
└── types/               # TypeScript-интерфейсы (Product, Order, Exhibition…)

config/nuxt/             # Разбивка nuxt.config.ts на модули
public/data/             # russia-regions.json (для карты доставки)
```

---

## Ключевые фичи

### Магазин (+checkout)
- Каталог товаров (акварели, открытки) с фильтрами, пагинацией, сортировкой
- Корзина в localStorage
- 5-шаговый checkout: контакты → доставка → оформление (опционально) → сводка → оплата
- Оплата через YooKassa (cloud function) или ручной перевод
- Уведомления в Telegram + Email при заказе

### Админка
- Добавление/редактирование товаров (с загрузкой в Firebase Storage)
- Управление заказами (статусы)
- Управление выставками (пререндер по slug)
- Статистика (echarts)
- Генератор сертификатов (PDF через cloud function)

### Выставки
- Страницы `/exhibitions/[slug]` — пререндерятся при сборке из Firebase
- Галерея работ, расписание, карта

### Уроки / плейлисты
- `/playlists` — список курсов
- `/playlists/[playlistSlug]/lessons` — уроки с видео

---

## Разработка

```bash
npm i
npm run dev          # dev-сервер на :3000
npm run lint         # ESLint
npm run lint:fix     # ESLint + autofix
npm run format       # Prettier write
npm run typecheck    # nuxi typecheck
npm run test         # vitest (все тесты)
npm run test:run     # vitest run (CI mode)
```

Тесты: `app/**/__tests__/*.spec.ts` и `*.test.ts` (vitest + happy-dom).

---

## Деплой

Push в `prod` → GitHub Actions: lint → typecheck → test → `npm run generate` → FTP на kalashyulya.ru.
