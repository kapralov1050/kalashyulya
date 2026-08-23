-- Phase D final: 3 prod-visible багов, найденные flow-trace аудитом 2026-08-23.
-- 1. framing: OrdersList.vue:204 показывает badge оформления, но orders.post.ts
--    не сохранял поле, orders.get.ts не возвращал → badge пропадал после reload.
-- 2. payment_id: orders.get.ts:69 хардкодил '' → payment-success.vue:287
--    искал order.paymentId === URL-paymentId, не находил → 30s timeout.
-- 3. notification_failed: orders.get.ts:70 хардкодил {false,false} → admin
--    "Уведомления не отправлены" баннер (OrdersList.vue:161) был мёртвый.

ALTER TABLE orders ADD COLUMN framing TEXT;        -- 'none'|'simple'|'premium'|null
ALTER TABLE orders ADD COLUMN payment_id TEXT;      -- YooKassa paymentId (через webhook или body)
ALTER TABLE orders ADD COLUMN notification_failed TEXT;  -- JSON: {"telegram":bool,"email":bool}
