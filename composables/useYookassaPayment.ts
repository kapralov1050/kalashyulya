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

  const openPaymentWidget = (
    confirmationToken: string,
    onSuccess: () => void,
    onError: (error: string) => void,
  ): void => {
    const scriptUrl = 'https://yoomoney.ru/checkout/button.js'

    const initWidget = () => {
      try {
        const checkout = new window.YooMoneyCheckoutWidget({
          confirmation_token: confirmationToken,
          return_url: `${window.location.origin}/shop/payment-success`,
          error_callback: (error: unknown) => onError(String(error)),
        })
        checkout.render('payment-widget-container')
        checkout.on('success', onSuccess)
        checkout.on('fail', (err: { error: { type: string } }) =>
          onError(err.error.type),
        )
      } catch (err) {
        onError(String(err))
      }
    }

    if (document.querySelector(`script[src="${scriptUrl}"]`)) {
      initWidget()
      return
    }

    const script = document.createElement('script')
    script.src = scriptUrl
    script.onload = initWidget
    script.onerror = () => onError('Failed to load payment widget')
    document.head.appendChild(script)
  }

  return {
    createPayment,
    openPaymentWidget,
  }
}
