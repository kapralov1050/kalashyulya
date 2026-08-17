-- Phase D — финальная до-миграция.
-- Все эти поля были в Firebase customer.delivery и customer.{userMessenger,userNickname}
-- но не были вытащены исходной миграцией. Догоняем здесь.

ALTER TABLE orders ADD COLUMN customer_messenger TEXT;
ALTER TABLE orders ADD COLUMN customer_nickname TEXT;

ALTER TABLE orders ADD COLUMN delivery_type TEXT;
ALTER TABLE orders ADD COLUMN delivery_recipient TEXT;
ALTER TABLE orders ADD COLUMN delivery_street TEXT;
ALTER TABLE orders ADD COLUMN delivery_house TEXT;
ALTER TABLE orders ADD COLUMN delivery_apartment TEXT;