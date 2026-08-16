-- products: каталог работ
CREATE TABLE IF NOT EXISTS products (
  id            TEXT PRIMARY KEY,         -- Firebase id оставляем как есть для совместимости URL
  title         TEXT NOT NULL,
  price         INTEGER NOT NULL,         -- в рублях, без копеек
  year          INTEGER,
  materials     TEXT,                     -- JSON-строка (array<string>)
  images        TEXT,                      -- JSON-строка (array<string> с URL)
  status        TEXT NOT NULL DEFAULT 'available',  -- 'available' | 'sold' | 'reserved'
  category      TEXT,
  description   TEXT,
  created_at    INTEGER NOT NULL,         -- unix ms
  updated_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

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
CREATE TABLE IF NOT EXISTS exhibitions (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  date          TEXT,                     -- ISO date string
  location      TEXT,
  cover_image   TEXT,
  status        TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'published'
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

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