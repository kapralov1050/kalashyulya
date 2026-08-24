/**
 * PATCH /api/orders/:id/payment-method — смена способа оплаты существующего заказа.
 * Используется в UI /shop/payment-success (payment-result.vue, pending/canceled ветки):
 * пользователь, у которого не получилось оплатить через ЮKassa, может
 * переключить заказ на ручную оплату (перевод на карту).
 *
 * Public: без requireAuth (как /api/orders/:id.patch с paymentId).
 * Защита:
 *  - принимаем ТОЛЬКО paymentMethod='manual' (откат на 'yookassa' запрещён);
 *  - запрет менять, если заказ в финальном статусе ('paid'/'shipped'/'cancelled');
 *  - 404 если заказ не найден.
 */
import * as v from 'valibot'
import { getDb } from '../../../utils/db'

const BodySchema = v.object({
  paymentMethod: v.picklist(['manual']),
})

const FINAL_STATUSES = ['paid', 'shipped', 'cancelled'] as const

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id обязателен' })
  }

  const raw = await readBody(event)
  const parsed = v.safeParse(BodySchema, raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'paymentMethod должен быть "manual"',
      data: parsed.issues,
    })
  }

  const db = getDb()
  const existing = db
    .prepare('SELECT status FROM orders WHERE id = ?')
    .get(id) as { status: string } | undefined

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Заказ не найден' })
  }

  if ((FINAL_STATUSES as readonly string[]).includes(existing.status)) {
    throw createError({
      statusCode: 409,
      statusMessage: `Нельзя сменить способ оплаты для заказа в статусе "${existing.status}"`,
    })
  }

  db.prepare('UPDATE orders SET payment_method = ?, updated_at = ? WHERE id = ?')
    .run('manual', Date.now(), id)

  // eslint-disable-next-line no-console
  console.log(`[orders/payment-method] id=${id} switched to manual`)

  return { ok: true, paymentMethod: 'manual' }
})