import type { Order } from '~/types'

interface ApiResponse {
  success: boolean
  data?: unknown
  error?: unknown
}

async function postNotification(
  url: string,
  body: Record<string, unknown>,
): Promise<ApiResponse> {
  try {
    const response = await $fetch(url, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return { success: true, data: response }
  } catch (error: unknown) {
    let errorMessage = 'Неизвестная ошибка'

    if (error && typeof error === 'object' && 'status' in error) {
      if (error.status === 404) {
        errorMessage = 'API endpoint не найден. Проверьте настройки сервера.'
      } else if (error.status === 500) {
        errorMessage = 'Ошибка сервера. Попробуйте позже.'
      }
    }
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string' &&
      error.message.includes('Network Error')
    ) {
      errorMessage = 'Проблемы с соединением. Проверьте интернет.'
    }
    if (
      error &&
      typeof error === 'object' &&
      'data' in error &&
      error.data &&
      typeof error.data === 'object' &&
      'error' in error.data
    ) {
      errorMessage = String(error.data.error)
    }

    return {
      success: false,
      error: {
        message: errorMessage,
        details: error,
        timestamp: new Date().toISOString(),
      },
    }
  }
}

export const useShop = () => {
  const sendOrderInfoTelegram = (orderData: Order): Promise<ApiResponse> => {
    const totalPrice = orderData.totalPrice
    return postNotification('/api/notifications/telegram', {
      orderId: 'client-retry',
      orderData,
      totalPrice,
    })
  }

  const sendOrderInfoEmail = (orderData: Order): Promise<ApiResponse> =>
    postNotification('/api/notifications/email', { orderData })

  return {
    sendOrderInfoTelegram,
    sendOrderInfoEmail,
  }
}
