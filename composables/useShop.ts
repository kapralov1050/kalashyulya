import type { Order } from '~/types'

export const useShop = () => {
  const sendOrder = async (orderData: Order) => {
    try {
      const config = useRuntimeConfig()
      const functionUrl = config.public.cloudFunctionUrl
      const response = await $fetch(functionUrl, {
        method: 'POST',
        body: orderData,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return { success: true, data: response }
    } catch (error) {
      console.error('Ошибка отправки заказа:', error)
      return { success: false, error }
    }
  }

  return {
    sendOrder,
  }
}
