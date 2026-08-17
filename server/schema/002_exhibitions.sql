-- Backfill exhibitions: добавляет колонки, утерянные при первичной миграции из Firebase.
--
-- SQLite не поддерживает `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`,
-- поэтому server/utils/db.ts:applyMigrations() прогоняет каждый ALTER через
-- `PRAGMA table_info` и добавляет только отсутствующие колонки.
-- Этот файл остаётся каноническим описанием shape: для свежих БД он не нужен
-- (колонки уже в 001_init.sql), но его удобно читать глазами при аудите.

ALTER TABLE exhibitions ADD COLUMN slug TEXT;
ALTER TABLE exhibitions ADD COLUMN tab_title TEXT;
ALTER TABLE exhibitions ADD COLUMN short_description TEXT;
ALTER TABLE exhibitions ADD COLUMN description_intro TEXT;
ALTER TABLE exhibitions ADD COLUMN description_body TEXT;
ALTER TABLE exhibitions ADD COLUMN date_end TEXT;
ALTER TABLE exhibitions ADD COLUMN date_range TEXT;
ALTER TABLE exhibitions ADD COLUMN date_start TEXT;
ALTER TABLE exhibitions ADD COLUMN location_venue TEXT;
ALTER TABLE exhibitions ADD COLUMN location_city TEXT;
ALTER TABLE exhibitions ADD COLUMN location_address TEXT;
ALTER TABLE exhibitions ADD COLUMN location_address_line TEXT;
ALTER TABLE exhibitions ADD COLUMN location_metro_json TEXT;
ALTER TABLE exhibitions ADD COLUMN location_map_link TEXT;
ALTER TABLE exhibitions ADD COLUMN is_free INTEGER NOT NULL DEFAULT 0;
ALTER TABLE exhibitions ADD COLUMN ticket_info TEXT;
ALTER TABLE exhibitions ADD COLUMN schedule_json TEXT;
ALTER TABLE exhibitions ADD COLUMN works_json TEXT;

CREATE INDEX IF NOT EXISTS idx_exhibitions_slug ON exhibitions(slug);
