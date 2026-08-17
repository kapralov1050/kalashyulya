-- products: каталог работ
CREATE TABLE IF NOT EXISTS products (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  description    TEXT,
  size           TEXT,
  material       TEXT,
  tecnic         TEXT,
  year           INTEGER,
  price          INTEGER NOT NULL,
  stock          INTEGER NOT NULL DEFAULT 0,
  views          INTEGER NOT NULL DEFAULT 0,
  certificate_id TEXT,
  is_reserved    INTEGER NOT NULL DEFAULT 0,  -- boolean as int (0|1)
  status         TEXT NOT NULL DEFAULT 'available',  -- 'available' | 'sold' | 'reserved'
  category_id    TEXT,                     -- FK к categories (пока строкой)
  images         TEXT,                     -- JSON array<string> с URL
  files          TEXT,                     -- JSON array<string> с filenames
  tags           TEXT,                     -- JSON array<string>
  framing        TEXT,                     -- JSON array<'frame'|'passepartout'>
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_certificate ON products(certificate_id);

-- orders: заказы (после чекаута)
CREATE TABLE IF NOT EXISTS orders (
  id            TEXT PRIMARY KEY,         -- формат YYYYMMDD-<rand>, как в текущем Firebase-коде
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  city          TEXT,
  address       TEXT,
  items_json    TEXT NOT NULL,            -- JSON [{productId, title, price, qty}]
  total         INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'new',  -- 'new' | 'paid' | 'shipped' | 'cancelled'
  comment       TEXT,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- exhibitions: выставки
-- Колонки ниже зеркалируют Firebase shape /exhibitions/{id} (см. 002_exhibitions.sql для бэкфилла).
CREATE TABLE IF NOT EXISTS exhibitions (
  id            TEXT PRIMARY KEY,
  slug          TEXT UNIQUE,
  title         TEXT NOT NULL,
  tab_title     TEXT,                     -- SEO <title>, опционально
  short_description TEXT,
  description_intro TEXT,
  description_body  TEXT,
  description   TEXT,                     -- legacy: concat(intro, body) для обратной совместимости
  date_start    TEXT,                     -- ISO date string
  date_end      TEXT,
  date          TEXT,                     -- legacy alias для date_start
  date_range    TEXT,                     -- human-readable диапазон, напр. "1–15 марта 2025"
  location_venue       TEXT,
  location_city        TEXT,
  location_address     TEXT,              -- полный адрес (наследуемое поле)
  location_address_line TEXT,
  location_metro_json  TEXT,              -- JSON array<string>
  location_map_link    TEXT,
  location      TEXT,                     -- legacy: склеенная строка venue,city,address
  cover_image   TEXT,
  is_free       INTEGER NOT NULL DEFAULT 0,
  ticket_info   TEXT,
  schedule_json TEXT,                     -- JSON array<ExhibitionScheduleDay>
  works_json    TEXT,                     -- JSON array<ExhibitionWork>
  status        TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'published'
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
-- idx_exhibitions_slug создаётся в 002_exhibitions.sql, чтобы существующие БД
-- (без колонки slug) могли сначала получить колонку через ALTER, а потом индекс.
CREATE INDEX IF NOT EXISTS idx_exhibitions_status ON exhibitions(status);

-- admin_users: админы
CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,            -- bcrypt hash
  name          TEXT,
  created_at    INTEGER NOT NULL
);

-- session: серверные сессии (по cookie session_id)
CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,         -- random 32 байта base64url
  user_id       INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at    INTEGER NOT NULL          -- unix ms
);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);