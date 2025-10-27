import type { DatabaseReference } from 'firebase/database'
import {
  getDataByPath,
  getSnapshotByPath,
  pushDataByPath,
  setDataByPath,
  updateDataByPath,
} from '~/helpers/firebase/manageDatabase'
import type { Order } from '~/types'
import { ref as dbRef, push } from 'firebase/database'

interface ApiResponse {
  success: boolean
  data?: any
  error?: any
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
    addOrderToUser,
    createOrder,
  }
}
