import type { Order } from '~/types'

interface CreateOrderResponse {
  id: string
}

export default defineEventHandler(async (event): Promise<CreateOrderResponse> => {
  try {
    const body = await readBody<Order>(event)
    if (!body || !body.customer || !body.purchase || typeof body.totalPrice !== 'number') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Некорректные данные заказа',
      })
    }
    if (!body.customer.email || !body.customer.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email и имя обязательны',
      })
    }
    return { id: `order_${Date.now()}` }
  } catch (err) {
    if (err instanceof Error && 'statusCode' in err) throw err
    throw createError({ statusCode: 500, statusMessage: 'Не удалось создать заказ' })
  }
})
