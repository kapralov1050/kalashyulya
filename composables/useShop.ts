import type { Order } from '~/types'

export const useShop = () => {
  const sendOrderInfoTelegram = async (orderData: Order) => {
    return await $fetch('/api/sendOrderTelegram', {
      method: 'POST',
      body: orderData,
    })
  }

  const sendOrderInfoEmail = async (orderData: Order) => {
    return await $fetch('/api/sendOrderEmail', {
      method: 'POST',
      body: orderData,
    })
  }

  return {
    sendOrderInfoTelegram,
    sendOrderInfoEmail,
  }
}
