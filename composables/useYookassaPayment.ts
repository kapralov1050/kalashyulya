import { useRuntimeConfig } from '#app'

export interface CreatePaymentOptions {
  orderId: string
  amount: number
  description: string
  returnUrl: string
  userId: string
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
      console.error('Create payment error:', error)

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

  const openPaymentWidget = (
    confirmationUrl: string,
    onSuccess: () => void,
    onError: (error: string) => void,
  ) => {
    // Загружаем YookassaCheckout скрипт динамически
    const script = document.createElement('script')
    script.src = 'https://yookassa.ru/sdk/v1/yookassa.js'
    script.async = true

    script.onload = () => {
      // @ts-expect-error - YookassaCheckout загружается глобально
      const checkout = new window.YookassaCheckout({
        confirmation_token: confirmationUrl,
        return_url: window.location.href,
        embedded: true,
      })

      checkout.on('success', onSuccess)
      checkout.on('error', onError)
      checkout.render('payment-widget-container')
    }

    script.onerror = () => {
      onError('Не удалось загрузить виджет оплаты')
    }

    document.body.appendChild(script)
  }

  return {
    createPayment,
    openPaymentWidget,
  }
}
