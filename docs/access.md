# Доступ к инфраструктуре kalashyulya.ru

> **Конфиденциальный документ.** Содержит реальные IP, ключи, секреты.
> Хранить в безопасном месте (не коммитить в публичный репозиторий).

---

## 1. VPS (Selectel)

### 1.1 Базовый доступ

| | |
|---|---|
| **IP** | `139.100.238.21` |
| **Hostname** | `vps` (alias) |
| **SSH user** | `kalashyulya` |
| **SSH key** | `~/.ssh/vps_deploy` (ED25519, fingerprint `SHA256:IAzxtRPPrmN2wPQOOLpOadg8PabTtMffMa97iHpXyfs`) |
| **sudo** | ❌ **Не работает** (середина августа 2026 — была потеряна привилегия). Используй `vps-root` для админ-задач. |

### 1.2 Root доступ

| | |
|---|---|
| **SSH alias** | `vps-root` |
| **SSH key** | `~/.ssh/id_rsa` |
| **User** | `root` |

Настроен в `~/.ssh/config` (Mac):

```
Host vps-root
    HostName 139.100.238.21
    User root
    IdentityFile ~/.ssh/id_rsa
    StrictHostKeyChecking no
```

### 1.3 Подключение с защитой от обрыва

`ssh -t user@vps` (pseudo-tty) или `mosh`. Не используй `ssh user@host` без `-t` для длительных операций.

### 1.4 Структура VPS

```
/var/www/kalashyulya/
├── .env                            # production env vars (chmod 600, uses root uid)
├── .output/                        # static assets (Nginx serves them)
│   └── public/                     #   built by CI, copied from docker container
├── data/
│   ├── data.db                     # SQLite база (rw для kalashyulya:kalashyulya)
│   ├── data.db-shm                 # WAL-mode shared memory file
│   ├── data.db-wal                 # WAL-mode write-ahead log
│   ├── data.db.bak                 # pre-Phase A backup
│   ├── data.db.bak-pre-exhibitions-20260817
│   └── data.db.bak-pre-phase-d-20260817-2122
└── scripts/                         # (planned) cron backup scripts

/etc/nginx/
└── sites-enabled/
    └── kalashyulya.ru              # reverse proxy 443 → 127.0.0.1:3000 (Nitro)
```

### 1.5 Сервисные консольные команды

```bash
# Логи контейнера
docker logs kalashyulya --tail 50 -f

# Перезапуск
docker restart kalashyulya

# Реконнект к bash
docker exec -it kalashyulya bash

# Остановить приложение
docker stop kalashyulya

# Обновить image (CI делает, но вручную)
docker pull ghcr.io/kapralov1050/kalashyulya:nitro
docker stop kalashyulya && docker rm kalashyulya
docker run -d \
  --name kalashyulya \
  --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  -v /var/www/kalashyulya/data:/var/lib/kalashyulya \
  --env-file /var/www/kalashyulya/.env \
  ghcr.io/kapralov1050/kalashyulya:nitro
```

### 1.6 Откат deployment

```bash
# Вариант 1: rollback контейнер на предыдущий Nitro-build
docker pull ghcr.io/kapralov1050/kalashyulya:nitro@sha-prev
docker stop kalashyulya && docker rm kalashyulya
docker run -d (...) ghcr.io/kapralov1050/kalashyulya:nitro@sha-prev

# Вариант 2: откатить только .output статику (если API не менялся)
cp -r /var/www/kalashyulya/.output.bak/* /var/www/kalashyulya/.output/

# Вариант 3: revision rollback code
git checkout <good-commit> -- .github/workflows/deploy.yml Dockerfile Dockerfile.prod nuxt.config.ts
git commit && git push  # CI откатывает
```

### 1.7 Откат базы данных

```bash
# Зайти на VPS (root)
ssh vps-root

# Список бэкапов
ls -la /var/www/kalashyulya/data/*.bak*

# Создать бэкап текущего состояния
cp /var/www/kalashyulya/data/data.db /var/www/kalashyulya/data/data.db.bak-pre-rollback-$(date +%Y%m%d)

# Откатить на старый бэкап
cp /var/www/kalashyulya/data/data.db.bak-pre-phase-d-20260817-2122 /var/www/kalashyulya/data/data.db
chown kalashyulya:kalashyulya /var/www/kalashyulya/data/data.db
chmod 644 /var/www/kalashyulya/data/data.db

# Удалить WAL-файлы (SQLite откроет базу заново)
rm -f /var/www/kalashyulya/data/data.db-shm /var/www/kalashyulya/data/data.db-wal

# Рестарт контейнера
docker restart kalashyulya
sleep 5

# Verify
curl https://kalashyulya.ru/api/products | jq 'length'
```

---

## 2. GitHub

### 2.1 Репозиторий

| | |
|---|---|
| **URL** | `https://github.com/kapralov1050/kalashyulya` |
| **Owner** | `kapralov1050` |
| **Main branch** | `prod` (deploys автоматически через CI) |
| **Разработка** | `new-customer-flow` (стабильная), feature-ветки |

### 2.2 GitHub CLI (локально)

```bash
# Авторизация
gh auth login

# Просмотр CI
gh run list --repo kapralov1050/kalashyulya --branch prod --limit 5
gh run watch <id> --exit-status

# Откат через revert
gh pr create --repo kapralov1050/kalashyulya --base prod --head revert-xxx
```

### 2.3 GitHub Container Registry (GHCR)

| | |
|---|---|
| **URL** | `https://ghcr.io/kapralov1050/kalashyulya` |
| **Tags** | `nitro` (latest), `nitro@sha-xxx` (each push) |
| **Auth** | автоматический через `secrets.GITHUB_TOKEN` в CI workflow |

Локальный просмотр:
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u kapralov1050 --password-stdin
docker pull ghcr.io/kapralov1050/kalashyulya:nitro
```

### 2.4 GitHub Secrets

`https://github.com/kapralov1050/kalashyulya/settings/secrets/actions` (Repository secrets)

**SSH / VPS:**
| Secret | Значение | Примечание |
|---|---|---|
| `VPS_HOST` | `139.100.238.21` | |
| `VPS_USER` | `kalashyulya` | |
| `VPS_SSH_KEY` | (private key contents) | ключ GH Actions deployer, **отдельный** от `~/.ssh/vps_deploy` на Mac |

**YooKassa (после миграции Phase D):**
| Secret | Значение |
|---|---|
| `YOOKASSA_SHOP_ID` | `1177657` (production) |
| `YOOKASSA_SECRET_KEY` | `live_***` (production) |
| `YOOKASSA_SHOP_ID_TEST` | test shop id |
| `YOOKASSA_SECRET_KEY_TEST` | test secret |
| `YOOKASSA_TEST_MODE` | `''` (в prod) / `'true'` (для preview) |

**Telegram (для `/api/notifications/telegram`):**
| Secret | Значение |
|---|---|
| `NUXT_TELEGRAM_BOT_TOKEN` | от @BotFather, `110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw` (legacy: `BOT_TOKEN`) |
| `NUXT_TELEGRAM_CHAT_ID` | id чата/группы (legacy: `CHAT_ID`) |

**Email (для `/api/notifications/email`):**
| Secret | Значение |
|---|---|
| `NUXT_SMTP_HOST` | SMTP-сервер |
| `NUXT_SMTP_PORT` | `465` |
| `NUXT_SMTP_USER` | `noreply@kalashyulya.ru` |
| `NUXT_SMTP_PASS` | SMTP-пароль |
| `NUXT_SMTP_FROM` | `noreply@kalashyulya.ru` |

**Storage / misc:**
| Secret | Значение |
|---|---|
| `NUXT_PUBLIC_BUCKET_NAME` | `kalashyulya-shop-images` (Yandex Object Storage) |
| `NUXT_PUBLIC_DADATA_API_KEY` | `29469aa734cd8e6f30c23e98af8f0e4886cee353` |
| `NUXT_PUBLIC_DADATA_SECRET_KEY` | `2a3d3e078f35b7ed0b8fa9a04c0f945057c7878f` |
| `NUXT_PUBLIC_SITE_URL` | `https://kalashyulya.ru` |
| `NUXT_PUBLIC_STATS` | `https://storage.yandexcloud.net/kalashyulya.stats/stats.json` |
| `NUXT_PUBLIC_LOCALES` | `https://storage.yandexcloud.net/kalashyulya-locales/...` |

**Yandex Cloud Functions (LEGACY — ещё используются):**
| Secret | URL | Используется в |
|---|---|---|
| `NUXT_PUBLIC_CLOUD_FUNCTION_UPLOAD_PRODUCT_URL` | `https://functions.yandexcloud.net/d4e???` | `useYandexDatabase.ts:uploadToMountedBucket` |
| `NUXT_PUBLIC_CLOUD_FUNCTION_DELETE_PRODUCT_FILE` | пусто в `.env` | `useYandexDatabase.ts:deleteProductImage` |
| `NUXT_PUBLIC_CLOUD_FUNCTION_UPLOAD_LOCALES` | `https://functions.yandexcloud.net/d4e67t9onoh8t1sqnb8h` | `app/stores/locales.ts` |
| `NUXT_PUBLIC_CLOUD_FUNCTION_UPLOAD_STATS` | `https://functions.yandexcloud.net/d4eim676ml7o6u0ah3js` | `app/plugins/router.ts:initMetrics` |
| `NUXT_PUBLIC_CLOUD_FUNCTION_PDF_GENERATOR_URL` | `https://functions.yandexcloud.net/d4ertp5k9fuh1q4d18ut` | `usePdfGenerator.ts` |
| `NUXT_PUBLIC_CLOUD_FUNCTION_DEPLOY` | `https://functions.yandexcloud.net/d4earmnrkfj9db3dhdov` | `NewExhibitionForm.vue` |
| `NUXT_PUBLIC_CLOUD_FUNCTION_DEPLOY_SECRET` | пусто | paired |

**Yandex Cloud Functions (УДАЛЕНЫ Phase C — можно стереть из GH Secrets):**
- `NUXT_PUBLIC_CLOUD_FUNCTION_TELEGRAM_URL` → мигрировано в `/api/notifications/telegram`
- `NUXT_PUBLIC_CLOUD_FUNCTION_EMAIL_URL` → мигрировано в `/api/notifications/email`
- `NUXT_PUBLIC_CLOUD_FUNCTION_EMAIL_NOTIFIER` → мигрировано в `/api/notifications/email`
- `NUXT_PUBLIC_CLOUD_FUNCTION_YOOKASSA_CREATE_PAYMENT` → мигрировано в `/api/payments/yookassa`

### 2.5 GitHub Variables

Пока не используются (только Secrets). Если понадобятся — Settings → Variables.

---

## 3. Локальный Mac

### 3.1 SSH ключи

| File | Use |
|---|---|
| `~/.ssh/vps_deploy` | ✅ подключение к `kalashyulya@vps` (без sudo) |
| `~/.ssh/id_rsa` | ✅ подключение к `root@vps-root` |
| `~/.ssh/config` | shorthands `vps`, `vps-root` |

Проверить:
```bash
ls -la ~/.ssh/vps_deploy ~/.ssh/id_rsa
ssh-add -l   # если добавлял в agent
```

### 3.2 Firebase service account (только для миграции)

| | |
|---|---|
| **File** | `~/Downloads/kalashyulya-lessons-firebase-adminsdk-fbsvc-c9831c7b79.json` |
| **DB URL** | `https://kalashyulya-lessons-default-rtdb.europe-west1.firebasedatabase.app` |
| **Команда** | `GOOGLE_APPLICATION_CREDENTIALS=/Users/kapra1/Downloads/kalashyulya-lessons-firebase-adminsdk-fbsvc-c9831c7b79.json npx tsx scripts/migrate-firebase-to-sqlite.ts` |

После миграции этот JSON нужен только для **повторных миграций** (если захочешь догонять новые записи из Firebase или ещё раз запускать скрипт). Удалять НЕ рекомендую — может пригодиться.

### 3.3 Docker

```bash
docker ps                              # запущенные контейнеры
docker images | grep kalashyulya      # наш image
docker logs kalashyulya -f            # live logs
docker exec -it kalashyulya bash      # shell внутрь контейнера
```

Docker Desktop → Preferences → Docker Engine → `linux/arm64` (Mac M-series).

### 3.4 Yandex Cloud (lockbox)

URL-ы Yandex Cloud Functions хранятся в `~/.ssh/config` shortcuts и в `.env` (gitignored). Для тонкой настройки — login в https://console.yandex.cloud.

---

## 4. База данных (SQLite)

### 4.1 Версии и пути

База SQLite лежит в одном файле. **Версионирование делается через бэкапы + git-коммиты миграций**, не через метки в файле.

| Окружение | Путь | Владелец | Чьи таблицы |
|---|---|---|---|
| **prod (VPS)** | `/var/www/kalashyulya/data/data.db` | `kalashyulya:kalashyulya` (или `root` после ручных действий) | products, orders, exhibitions, categories, certificates_counter, admin_users, sessions |
| **dev local** | `/Users/kapra1/проекты frontend/kalashyulya/data.db` (gitignored) | `kapra1` | то же |
| **CI tests** | per-test tmp файл (см. `server/api/__tests__/`) | ci | только то что тест создаёт |

**Файлы БД на VPS:**
```
/var/www/kalashyulya/data/
├── data.db                         # активная
├── data.db-shm                     # WAL shared memory
├── data.db-wal                     # WAL write-ahead log
├── data.db.bak                     # pre-Phase A (до фикса orders.get)
├── data.db.bak-pre-exhibitions-20260817  # pre-Phase B
└── data.db.bak-pre-phase-d-20260817-2122  # pre-Phase D (с categories)
```

### 4.2 Миграции

Schema пронумерована: `001_init.sql`, `002_exhibitions.sql`, `003_orders.sql`. Применяются автоматически при старте Nitro через `getDb()` → `applyMigrations()`.

При добавлении столбцов — **не удалять старые `.sql` файлы**, добавлять новые:
```
server/schema/004_<feature>.sql   # ALTER TABLE ... ADD COLUMN ...
```

Реализация мигратора — `server/utils/db.ts` (lines 27-65). Читает все файлы из `schema/`, удаляет комментарии, режет на `;`, идемпотентно применяет через `pragma table_info` (для `ADD COLUMN`).

Применить миграцию вручную:
```bash
ssh vps-root
cd /var/www/kalashyulya
docker exec -it kalashyulya bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('/var/lib/kalashyulya/data.db');
db.exec('CREATE INDEX IF NOT EXISTS ...');
"
```

### 4.3 Просмотр содержимого

#### Вариант 1 — `sqlite3` CLI (если установлен)

```bash
# Локально
brew install sqlite3
sqlite3 /Users/kapra1/проекты\ frontend/kalashyulya/data.db

# На VPS
ssh vps-root 'apt install -y sqlite3'
sqlite3 /var/www/kalashyulya/data/data.db

# Команды
.tables                          # список таблиц
.schema orders                  # DDL таблицы
SELECT * FROM products LIMIT 5;
PRAGMA table_info(orders);       # колонки
.quit
```

#### Вариант 2 — `better-sqlite3` через Node (всегда работает)

```bash
# Локально
node -e "
const db = require('better-sqlite3')('./data.db');
console.log('products:', db.prepare('SELECT COUNT(*) as n FROM products').get().n);
console.log('orders:', db.prepare('SELECT COUNT(*) as n FROM orders').get().n);
console.log('exhibitions:', db.prepare('SELECT COUNT(*) as n FROM exhibitions').get().n);
console.log('admin_users:', db.prepare('SELECT COUNT(*) as n FROM admin_users').get().n);
console.log('categories:', db.prepare('SELECT COUNT(*) as n FROM categories').get().n);
console.log('certificates_counter:', db.prepare('SELECT year, count FROM certificates_counter').all());
"

# На VPS
ssh vps 'docker exec kalashyulya node -e "..." '
```

#### Вариант 3 — VS Code расширения

| Расширение | Зачем |
|---|---|
| `alexcvzz.vscode-sqlite` | встроенный GUI, фильтры, экспорт CSV |
| `bcr.vs-sqlite` | обозреватель таблиц в side panel |
| `SQLite Viewer` | минималистичный UI |

Открыть: правый клик по `data.db` → "Open Database" (или аналог).

#### Вариант 4 — DB Browser for SQLite (отдельно)

URL: https://sqlitebrowser.org
GUI: список таблиц, схемы, данные, индексы. Полезно для детального изучения.

#### Вариант 5 — Web

- `sqliteonline.com` — paste SQLite dump и смотри данные
- `sqlime.com` — то же

(осторожно с приватными данными — не заливай real orders на публичный сайт)

#### Полезные команды прямо сейчас

```bash
# Сколько товаров/заказов в prod
curl -s https://kalashyulya.ru/api/products | jq 'length'
curl -s https://kalashyulya.ru/api/orders | jq 'length'
curl -s https://kalashyulya.ru/api/categories | jq 'length'

# Найти товар по id
curl -s https://kalashyulya.ru/api/products | jq '.[] | select(.id=="product_100")'

# Сделать нового админа (локально, затем scp на VPS)
ADMIN_EMAIL='sashakapralov@bk.ru' ADMIN_PASSWORD='xxx' npx tsx server/scripts/seed-admin.ts
```

### 4.4 Восстановление / откат

| Сценарий | Команда |
|---|---|
| После тестового изменения | `cp /var/www/kalashyulya/data/data.db.bak-pre-phase-d-20260817-2122 /var/www/kalashyulya/data/data.db` |
| После миграции | `cp /var/www/kalashyulya/data/data.db.bak-pre-exhibitions-20260817 /var/www/kalashyulya/data/data.db` |
| До любых изменений | `cp /var/www/kalashyulya/data/data.db.bak /var/www/kalashyulya/data/data.db` |
| Полный бэкап перед действием | `ssh vps-root 'cp /var/www/kalashyulya/data/data.db /var/www/kalashyulya/data/data.db.bak-pre-action-$(date +%Y%m%d-%H%M)'` |

Не забыть после отката:
```bash
chown kalashyulya:kalashyulya /var/www/kalashyulya/data/data.db
chmod 644 /var/www/kalashyulya/data/data.db
rm -f /var/www/kalashyulya/data/data.db-shm /var/www/kalashyulya/data/data.db-wal
docker restart kalashyulya
```

### 4.5 Backup cron (в плане)

Скрипт `scripts/backup.py` написан (Phase C → Phase D), но **ещё не запушен на VPS**. Когда надоест терять бэкапы вручную:

```bash
# На VPS (root)
mkdir -p /var/www/kalashyulya/scripts
cp <repo>/scripts/backup.py /var/www/kalashyulya/scripts/

# Cron
cat > /etc/cron.d/kalashyulya-backup <<'EOF'
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
0 3 * * * root /usr/local/bin/python3 /var/www/kalashyulya/scripts/backup.py >> /var/log/kalashyulya-backup.log 2>&1
EOF

# Создать /usr/local/bin/python3 (если нет)
ln -s $(which python3) /usr/local/bin/python3
```

`backup.py`:
- `PRAGMA wal_checkpoint(TRUNCATE)` (безопасно)
- `Connection.backup()` (атомарно)
- Сохраняет в `/var/www/kalashyulya/backups/daily/data-YYYY-MM-DD.db`
- Копия в `weekly/data-YYYY-MM-DD.db` (по воскресеньям)
- Ротация: 7 daily + 4 weekly
- Проверка `PRAGMA integrity_check` после бэкапа

---

## 5. Nginx

Nginx reverse-proxy на VPS. Конфиг:

```bash
ssh vps-root
cat /etc/nginx/sites-enabled/kalashyulya.ru
```

Ожидаемое:
```nginx
server {
    listen 443 ssl;
    server_name kalashyulya.ru www.kalashyulya.ru;
    
    ssl_certificate /etc/letsencrypt/live/kalashyulya.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kalashyulya.ru/privkey.pem;
    
    # Static assets прямо с диска
    root /var/www/kalashyulya/.output/public;
    location /_nuxt/ {
        try_files $uri =404;
        expires 30d;
    }
    
    # API + SPA fallback
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Полезные команды:
```bash
sudo nginx -t                          # проверить конфиг
sudo nginx -s reload                  # применить без downtime
sudo certbot renew --dry-run          # проверить SSL-auto-renew
sudo certbot renew                    # форс-renew
```

---

## 6. CI/CD pipeline

`https://github.com/kapralov1050/kalashyulya/actions`

| Job | What | Timeout |
|---|---|---|
| ESLint Fix | автоматический lint --fix | ~15s |
| ESLint Check | проверка | ~15s |
| Prettier Fix | автоматический format | ~10s |
| Prettier Check | проверка | ~10s |
| TypeScript Check | `npm run typecheck` | ~5s |
| Run tests | `npm run test:run` | ~2-3s |
| **deploy-prod** | build→push→pull→restart | ~3min |

`deploy-prod` запускается **только** при `ref == 'refs/heads/prod'` (PR в prod) или через repository_dispatch.

---

## 7. Yandex Cloud — что ещё в нём

| Сервис | URL | Зачем |
|---|---|---|
| Console | https://console.yandex.cloud | UI админка, логи функций |
| Cloud Functions | https://functions.yandexcloud.net | legacy endpoints (7 шт. ещё живы) |
| Object Storage | https://storage.yandexcloud.net | бакет `kalashyulya-shop-images` для картинок |
| Lockbox | (нет доступа?) | секреты для YC Functions (мы НЕ редактируем) |
| YDB (serverless) | grpcs://ydb.serverless.yandexcloud.net | старые данные в Firebase-эру; сейчас почти не используется |

Если понадобится доступ:
- Yandex Cloud console → пользователь `kapralov1050` (предположительно)
- Логин через Yandex ID

---

## 8. Что делать в типичных ситуациях

### Приложение лежит (503 / 502)

```bash
ssh vps-root
docker ps                          # запущен ли контейнер?
docker logs kalashyulya --tail 30  # что в логах?
docker restart kalashyulya        # рестарт
```

Если после restart не помогло:
```bash
docker pull ghcr.io/kapralov1050/kalashyulya:nitro
docker stop kalashyulya && docker rm kalashyulya
docker run -d ...
```

### Изменил код — хочу на прод

```bash
git push origin prod  # CI задеплоит сам
# или
gh run watch $(gh run list --repo kapralov1050/kalashyulya --branch prod --limit 1 --json databaseId -q '.databaseId') --exit-status
```

### Изменил только `data.db` локально — хочу на прод

```bash
# SSH как root
ssh vps-root
# Backup
cp /var/www/kalashyulya/data/data.db /var/www/kalashyulya/data/data.db.bak-pre-new-$(date +%Y%m%d)
# Upload
scp -i ~/.ssh/id_rsa /Users/.../data.db root@139.100.238.21:/var/www/kalashyulya/data/data.db.new
# Replace
cd /var/www/kalashyulya/data
rm -f data.db-shm data.db-wal
mv data.db.new data.db
chown kalashyulya:kalashyulya data.db
chmod 644 data.db
docker restart kalashyulya
```

### Нужно сделать нового админа

```bash
# Локально
cd /Users/kapra1/проекты\ frontend/kalashyulya
ADMIN_EMAIL='new@x.ru' ADMIN_PASSWORD='secure123' npx tsx server/scripts/seed-admin.ts
# Зальёт в ./data.db. Чтобы попало на прод — повторить upload data.db
```

### Нужно восстановить данные в Firebase (гипотетически)

```bash
GOOGLE_APPLICATION_CREDENTIALS=/Users/kapra1/Downloads/kalashyulya-lessons-firebase-adminsdk-fbsvc-c9831c7b79.json \
FIREBASE_DATABASE_URL=https://kalashyulya-lessons-default-rtdb.europe-west1.firebasedatabase.app \
npx tsx scripts/dump-firebase-to-json.ts > local-export.json
# Скрипт dump'а ещё не написан — задача на будущее
```

---

## 9. Контакты владельца

| | |
|---|---|
| **Имя** | Александр Капралов |
| **Telegram** | @kapralov1050 (примерно) |
| **GitHub** | @kapralov1050 |
| **Email (admin)** | sashakapralov@bk.ru |

---

## 10. Контрольный список при смене чего-то

- [ ] Перед миграцией prod базы: бэкап на VPS (`cp data.db data.db.bak-pre-<feature>-<date>`)
- [ ] Перед обновлением кода: проверить что все секреты в GH Secrets → `https://github.com/kapralov1050/kalashyulya/settings/secrets/actions`
- [ ] После любого деплоя: `curl https://kalashyulya.ru/api/products` — длина массива
- [ ] Раз в месяц: проверять что бэкап БД работает (когда cron настроен)
- [ ] Перед обновлением Yandex Cloud Functions / отключением Firebase: проверить что фронт уже не на них зависит (`grep cloudFunction app/`)
- [ ] При потере SSH доступа: Selectel даёт доступ через KVM-консоль (см. панель https://my.selectel.ru)

---

## 11. Рекомендации (не срочно)

1. **Настроить backup cron** на VPS — `scripts/backup.py` готов, просто deploy.
2. **Создать отдельный staging VPS** — сейчас тест prod = тест prod, нет промежуточного окружения.
3. **Перейти с Firebase Functions на свои endpoints** — 7 ещё в работе, можно портировать по приоритету (PDF и Locales — видимо самые важные).
4. **Грохнуть FIREBASE_* из historical envvars** — `DATABASE_URL`, `SERVICE_ACCOUNT` уже не нужны для runtime, только для миграции.
5. **Отключить автоматический deploy при push в prod** — попросить PR-ревью (хоть от бота), сейчас релиз делается сразу.
6. **Подключить observability** — Sentry / Grafana / pino.logger. Сейчас логи в `docker logs`, что неудобно для долгого поиска.