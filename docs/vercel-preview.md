# Vercel Preview (UI-only)

> **Status:** готов к настройке. Workflow создан, фикстуры загружены, нужно только:
> 1. Подключить репо в Vercel UI
> 2. Добавить 3 секрета в GitHub Secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
> 3. Первый пуш в `main` — задеплоит preview

## Что это даёт

Preview на `https://kalashyulya.vercel.app` для визуальной проверки UI перед merge в `prod`.

**Работает:**
- Главная страница, hero, каталог
- Карточки товаров (20 случайных из prod)
- Категории в фильтре
- Страницы выставок
- Корзина, чекаут (форма без отправки)

**Не работает (нужен prod VPS):**
- Реальные заказы (SQLite пустая)
- Админка (нет БД)
- Реальная оплата через YooKassa
- Telegram/Email уведомления (нет credentials)

## Архитектура

```
┌─────────────────────────────────────┐
│ Vercel Preview (UI-only)             │
│                                     │
│ - Nitro preset=vercel               │
│ - process.env.VERCEL=1              │
│ - server/utils/fixtures.ts читает   │
│   server/fixtures/*.json            │
│ - Статика + /api/* (только GET)     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Prod VPS (полный функционал)        │
│                                     │
│ - Nitro preset=node-server          │
│ - Docker container с SQLite         │
│ - server/utils/db.ts → реальная БД  │
│ - YooKassa + Telegram + Email        │
└─────────────────────────────────────┘
```

Переключение делает `server/utils/fixtures.ts:isVercelPreview()`:

```ts
export function isVercelPreview(): boolean {
  return !!process.env.VERCEL
}
```

Каждый public-endpoint (`products`, `categories`, `exhibitions`) в начале проверяет флаг и выбирает источник данных.

## Setup (один раз)

### 1. Создать проект в Vercel

1. Зайти в https://vercel.com/new (логин через GitHub)
2. Import Git Repo → выбрать `kapralov1050/kalashyulya`
3. **Root Directory:** оставить пустым (используется корень)
4. **Build Command:** оставить пустым (workflow CI собирает)
5. **Output Directory:** `.vercel/output` (после `npx nuxt build` с preset=vercel)
6. **Environment Variables** (добавить в Vercel UI):
   - `NITRO_PRESET=vercel`
   - `NUXT_PUBLIC_SITE_URL=https://kalashyulya.vercel.app`
   - `NUXT_PUBLIC_BUCKET_NAME=kalashyulya-shop-images` (для картинок)
7. Deploy → получится первый preview с ошибкой (там нет output ещё) → Continue

### 2. Скопировать 3 секрета из Vercel → GitHub

```
VERCEL_ORG_ID      = team_xxx из URL https://vercel.com/teams/xxx/settings
VERCEL_PROJECT_ID  = prj_xxx из Project Settings → General
VERCEL_TOKEN       = Settings → Tokens → Create Token (Full Account или scope на проект)
```

URL: `https://github.com/kapralov1050/kalashyulya/settings/secrets/actions`

### 3. Отключить Vercel auto-deploy (опционально)

Так как GitHub Actions workflow уже деплоит через `vercel deploy --prebuilt`, авто-deploy от Vercel GitHub Integration будет конфликтовать. В Vercel UI: **Settings → Git → отключить** "Deploy on push to main" (или просто не подключать автоматический deploy).

Альтернатива: вообще не подключать Git Integration, деплоить только через CI.

### 4. Первый пуш

```bash
git checkout main
git pull origin main   # если уже пушили
# теперь push запустит workflow:
git push origin main
# CI → build → vercel deploy → preview URL в логах
```

## Как обновить fixtures

Когда в prod добавляются новые товары/категории/выставки и хочется видеть их в preview:

```bash
# Локально (или в CI на PR)
node scripts/export-fixtures.mjs
# → обновляет server/fixtures/*.json

git add server/fixtures/ && git commit -m "fixtures: update from prod" && git push
```

## Архитектура файлов

```
server/utils/
├── db.ts                          # real SQLite (VPS)
└── fixtures.ts                    # JSON fixtures (Vercel)

server/fixtures/
├── products.json                  # 20 товаров
├── categories.json                # 5 категорий
└── exhibitions.json               # 4 выставки

server/api/
├── products.get.ts                # isVercelPreview → return fixtures, else SQLite
├── categories.get.ts              # то же
└── exhibitions.get.ts             # то же

scripts/
└── export-fixtures.mjs            # обновляет fixtures из prod API

.github/workflows/
└── deploy-vercel-preview.yml      # push → main → CI build → vercel deploy --prebuilt

nuxt.config.ts                     # nitro.preset = NITRO_PRESET env (? 'node-server')
```

## Известные ограничения

1. **`better-sqlite3` native binding** — Vercel build игнорирует его (serverless не запускается через nitro:vercel), но если бы запустился — мог быть несовместим с Vercel runtime arch. Поэтому мы не вызываем SQLite на Vercel.
2. **Картинки** — берутся с `storage.yandexcloud.net` (Yandex Object Storage, открытый bucket). Если bucket станет приватным — preview сломается.
3. **Изображения в fixtures** — только URL, не сами файлы. Размер repo не раздувается.
4. **Только 20 товаров** в fixtures. Если UI тестируется на конкретный товар — добавь его в fixtures вручную и закоммить.

## Troubleshooting

### Build падает с "preset должен быть vercel"

В `nuxt.config.ts`:
```ts
preset: (process.env.NITRO_PRESET as 'vercel' | 'node-server') ?? 'node-server',
```

Убедиться что `NITRO_PRESET=vercel` установлен в env workflow перед `npx nuxt build`.

### Vercel CLI выдаёт ошибку авторизации

`VERCEL_TOKEN` пустой или истёк. Создать новый токен в Vercel UI → Settings → Tokens.

### Preview показывает пустой каталог

- `server/fixtures/products.json` пустой → запустить `node scripts/export-fixtures.mjs`
- `isVercelPreview()` не вернула `true` → проверить что `process.env.VERCEL === '1'` в runtime

### Хочу preview без push в main

```bash
gh workflow run deploy-vercel-preview.yml
```

(workflow поддерживает `workflow_dispatch`)
