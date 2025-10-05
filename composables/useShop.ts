import type { Order } from '~/types'

interface ApiResponse {
  success: boolean
  data?: any
  error?: any
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

      console.log('Telegram response:', response)
      return { success: true, data: response }
    } catch (error: any) {
      console.error('Ошибка отправки в Telegram:', error)

      // Подробная обработка разных типов ошибок
      let errorMessage = 'Неизвестная ошибка'

      if (error?.status === 404) {
        errorMessage = 'API endpoint не найден. Проверьте настройки сервера.'
      } else if (error?.status === 500) {
        errorMessage = 'Ошибка сервера. Попробуйте позже.'
      } else if (error?.message?.includes('Network Error')) {
        errorMessage = 'Проблемы с соединением. Проверьте интернет.'
      } else if (error?.data?.error) {
        errorMessage = error.data.error
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

      console.log('Email response:', response)
      return { success: true, data: response }
    } catch (error: any) {
      console.error('Ошибка отправки Email:', error)

      let errorMessage = 'Неизвестная ошибка'

      if (error?.status === 404) {
        errorMessage = 'Email service недоступен'
      } else if (error?.status === 500) {
        errorMessage = 'Ошибка email сервера'
      } else if (error?.message?.includes('Network Error')) {
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
