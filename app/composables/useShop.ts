import {
  getSnapshotByPath,
  pushDataByPath,
  updateDataByPath,
} from '~/helpers/firebase/manageDatabase'
import type { Order } from '~/types'

interface ApiResponse {
  success: boolean
  data?: unknown
  error?: unknown
}

export interface newOrderInUserProfile {
  title: string
  price: number
  status:
    | 'новый заказ'
    | 'в работе'
    | 'ожидает отправки'
    | 'отправлен'
    | 'закрыт'
    | 'отменен'
}

export const useShop = () => {
  const config = useRuntimeConfig()

  const createOrder = async (userId: string, newOrder: Order) => {
    try {
      await pushDataByPath(newOrder, `orders`)

      const newOrderToProfile: newOrderInUserProfile[] =
        newOrder.purchase.order.map(item => {
          return {
            title: item.title,
            price: item.price,
            status: 'новый заказ',
          }
        })

      addOrderToUser(userId, newOrderToProfile)
    } catch (error) {
      return { order: null, error }
    }
  }

  const addOrderToUser = async (
    userId: string,
    newOrder: newOrderInUserProfile[],
  ) => {
    try {
      const snapshot = await getSnapshotByPath(`users/${userId}/orders`)
      const currentOrders = snapshot ? Object.values(snapshot) : []

      // Добавляем новый заказ
      const updatedOrders = [...currentOrders, ...newOrder]

      // Обновляем массив заказов
      await updateDataByPath(
        {
          orders: updatedOrders,
        },
        `users/${userId}`,
      )

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error }
    }
  }

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
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('Network Error')) {
        errorMessage = 'Проблемы с соединением. Проверьте интернет.'
      }
      if (error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'error' in error.data) {
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
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('Network Error')) {
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
    addOrderToUser,
    createOrder,
  }
}
