import { useRuntimeConfig } from '#app'

export interface CreatePaymentOptions {
  orderId: string
  amount: number
  description: string
  returnUrl: string
  currency: string
  customer: {
    email: string
    phone?: string
  }
}

export interface CreatePaymentResult {
  success: boolean
  paymentId?: string
  confirmationUrl?: string
  error?: string
}

export const useYookassaPayment = () => {
  const config = useRuntimeConfig()

  const createPayment = async (
    options: CreatePaymentOptions,
  ): Promise<CreatePaymentResult> => {
    try {
      const functionUrl = config.public
        .cloudFunctionYookassaCreatePayment as string

      if (!functionUrl) {
        throw new Error(
          'Yookassa create payment function URL is not configured',
        )
      }

      const response = await $fetch<{
        success: boolean
        paymentId?: string
        confirmationUrl?: string
        error?: string
      }>(functionUrl, {
        method: 'POST',
        body: options,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return response
    } catch (error: unknown) {
      let errorMessage = 'Неизвестная ошибка'

      if (error && typeof error === 'object' && 'status' in error) {
        if (error.status === 404) {
          errorMessage = 'Сервис оплаты недоступен'
        } else if (error.status === 500) {
          errorMessage = 'Ошибка сервера оплаты'
        }
      }

      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Network Error')
      ) {
        errorMessage = 'Проблемы с соединением'
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  return {
    createPayment,
  }
}
