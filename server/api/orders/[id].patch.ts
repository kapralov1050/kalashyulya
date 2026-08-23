import { getDb } from '../../utils/db'

interface PatchPaymentBody {
  paymentId: string
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id обязателен' })
  }

  const body = await readBody<PatchPaymentBody>(event)
  if (!body || typeof body.paymentId !== 'string' || body.paymentId.trim() === '') {
    throw createError({ statusCode: 400, statusMessage: 'paymentId обязателен' })
  }

  const info = getDb()
    .prepare('UPDATE orders SET payment_id = ?, updated_at = ? WHERE id = ?')
    .run(body.paymentId.trim(), Date.now(), id)

  if (info.changes === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Заказ не найден' })
  }

  return { ok: true }
})
