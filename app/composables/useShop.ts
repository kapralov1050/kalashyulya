import type { Order } from '~/types'

interface ApiResponse {
  success: boolean
  data?: unknown
  error?: unknown
}

export const useShop = () => {
  const config = useRuntimeConfig()

  const sendOrderInfoTelegram = async (
    orderData: Order,
  ): Promise<ApiResponse> => {
    try {
      const functionUrl = config.public.cloudFunctionTelegramUrl

      const response = await $fetch(functionUrl, {
        method: 'POST',
        body: orderData,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return { success: true, data: response }
    } catch (error: unknown) {
      // Ошибка отправки в Telegram

      // Подробная обработка разных типов ошибок
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

  const sendOrderInfoEmail = async (orderData: Order): Promise<ApiResponse> => {
    try {
      const functionUrl = config.public.cloudFunctionEmailUrl

      const response = await $fetch(functionUrl, {
        method: 'POST',
        body: orderData,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Email response logged
      return { success: true, data: response }
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Ошибка отправки Email:', error)

      let errorMessage = 'Неизвестная ошибка'

      if (error && typeof error === 'object' && 'status' in error) {
        if (error.status === 404) {
          errorMessage = 'Email service недоступен'
        } else if (error.status === 500) {
          errorMessage = 'Ошибка email сервера'
        }
      }
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Network Error')
      ) {
        errorMessage = 'Проблемы с соединением при отправке email'
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

  return {
    sendOrderInfoTelegram,
    sendOrderInfoEmail,
  }
}
