-- Phase D-фикс: payment_method. Раньше orders.get.ts хардкодил 'manual',
-- что скрывало реальный способ оплаты (yookassa/manual) в админке и
-- status-уведомлениях. Теперь значение хранится в БД.

ALTER TABLE orders ADD COLUMN payment_method TEXT;
