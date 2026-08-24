import type { Ref } from 'vue'
import type { OrderInBase } from '~/types'
import {
  initialState,
  setError,
  setPollingTimedOut,
  setStatus,
  setSwitchedToManual,
} from './usePaymentResultState'
import type { PaymentResultState } from './usePaymentResultState'
import type { YookassaPaymentStatus } from './useYookassaPayment'

const POLLING_INTERVAL_MS = 5_000
const POLLING_MAX_ATTEMPTS = 6 // 6 * 5s = 30 секунд — достаточно, чтобы поймать succeeded, но не заставлять пользователя ждать 2 минуты

function stateToYookassaStatus(
  state: PaymentResultState,
): YookassaPaymentStatus | null {
  switch (state.kind) {
    case 'succeeded':
      return 'succeeded'
    case 'pending':
      return 'pending'
    case 'canceled':
      return 'canceled'
    case 'notFound':
      return 'not_found'
    default:
      return null
  }
}

function hasOrder(
  state: PaymentResultState,
): state is Extract<
  PaymentResultState,
  { kind: 'succeeded' | 'pending' | 'canceled' | 'switchedToManual' }
> {
  return (
    state.kind === 'succeeded' ||
    state.kind === 'pending' ||
    state.kind === 'canceled' ||
    state.kind === 'switchedToManual'
  )
}

export function usePaymentResult(initialPaymentId: Ref<string | null>) {
  const ordersStore = useOrdersStore()
  const { allOrders } = storeToRefs(ordersStore)
  const { clearBasket } = useBasketStore()
  const { getPaymentStatus } = useYookassaPayment()
  const api = useApi()
  const router = useRouter()
  const { printLocale } = useLocales()

  const state = ref<PaymentResultState>(initialState())
  const switchingToManual = ref(false)

  let paymentId: string | null = null
  let pollingTimer: ReturnType<typeof setInterval> | null = null
  let pollingAttempts = 0
  let initialized = false

  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  function findOrder(pid: string): OrderInBase | null {
    return allOrders.value.find(o => o.paymentId === pid) ?? null
  }

  async function maybeNotifySeller(): Promise<void> {
    let orderToNotify: OrderInBase | null = null
    const s = state.value
    if (hasOrder(s) && s.order) {
      orderToNotify = s.order
    } else if (paymentId) {
      orderToNotify = findOrder(paymentId)
    }
    if (!orderToNotify) return
    await api.notifySeller(String(orderToNotify.id))
  }

  async function pollTick(): Promise<void> {
    pollingAttempts += 1
    if (pollingAttempts > POLLING_MAX_ATTEMPTS) {
      stopPolling()
      state.value = setPollingTimedOut(state.value)
      return
    }
    if (!paymentId) {
      stopPolling()
      return
    }
    const result = await getPaymentStatus(paymentId)
    if (
      result.success &&
      result.status &&
      result.status !== stateToYookassaStatus(state.value)
    ) {
      state.value = setStatus(
        state.value,
        result.status,
        findOrder(paymentId),
        paymentId,
      )
      if (
        result.status !== 'pending' &&
        result.status !== 'waiting_for_capture'
      ) {
        stopPolling()
        if (result.status === 'succeeded') {
          metrics.trackButtonClick('paymentSuccess')
          clearBasket()
          localStorage.removeItem('pendingPaymentId')
          localStorage.removeItem('pendingOrderId')
          await maybeNotifySeller()
        } else {
          localStorage.removeItem('pendingPaymentId')
          localStorage.removeItem('pendingOrderId')
        }
      }
    } else if (!result.success) {
      stopPolling()
    }
  }

  function startPolling() {
    stopPolling()
    pollingAttempts = 0
    pollingTimer = setInterval(pollTick, POLLING_INTERVAL_MS)
  }

  async function fetchStatus(): Promise<void> {
    if (!paymentId) {
      state.value = setError(
        state.value,
        printLocale('payment_success_no_payment_id_error', {
          defaultValue:
            'Не передан ID платежа. Перейдите по ссылке из письма или напишите мне в Telegram @kalashyulya.',
        }),
      )
      return
    }
    const result = await getPaymentStatus(paymentId)

    if (result.success && result.status === 'not_found') {
      state.value = setStatus(state.value, 'not_found', null, paymentId)
      localStorage.removeItem('pendingPaymentId')
      localStorage.removeItem('pendingOrderId')
      return
    }

    if (!result.success || !result.status) {
      state.value = setError(
        state.value,
        result.error ||
          printLocale('payment_success_status_check_failed', {
            defaultValue: 'Не удалось проверить статус платежа.',
          }),
      )
      return
    }

    state.value = setStatus(
      state.value,
      result.status,
      findOrder(paymentId),
      paymentId,
    )

    if (result.status === 'succeeded') {
      metrics.trackButtonClick('paymentSuccess')
      clearBasket()
      localStorage.removeItem('pendingPaymentId')
      localStorage.removeItem('pendingOrderId')
      await maybeNotifySeller()
    } else if (result.status === 'canceled') {
      localStorage.removeItem('pendingPaymentId')
      localStorage.removeItem('pendingOrderId')
    } else {
      startPolling()
    }
  }

  async function init(): Promise<void> {
    if (initialized) return
    initialized = true

    paymentId = initialPaymentId.value

    if (!paymentId) {
      state.value = setError(
        state.value,
        printLocale('payment_success_no_payment_id_error', {
          defaultValue:
            'Не передан ID платежа. Перейдите по ссылке из письма или напишите мне в Telegram @kalashyulya.',
        }),
      )
      return
    }

    await Promise.all([ordersStore.loadOrders().catch(() => {}), fetchStatus()])
  }

  watch(
    () => allOrders.value,
    () => {
      if (!paymentId) return
      const found = findOrder(paymentId)
      if (!found) return
      const s = state.value
      if (hasOrder(s) && !s.order) {
        state.value = { ...s, order: found }
      }
    },
    { immediate: true },
  )

  onUnmounted(() => stopPolling())

  function retryPayment() {
    if (!paymentId) {
      router.push('/shop')
      return
    }
    localStorage.removeItem('pendingPaymentId')
    localStorage.removeItem('pendingOrderId')

    let found: OrderInBase | null = null
    const s = state.value
    if (hasOrder(s)) found = s.order
    if (!found) found = findOrder(paymentId)
    if (!found) {
      router.push('/shop')
      return
    }

    const orderId = String(found.id)
    const amount = found.totalPrice || 0
    const description = printLocale(
      'payment_success_order_payment_description',
      {
        params: { orderId },
        defaultValue: `Оплата заказа #${orderId}`,
      },
    )
    router.push({
      path: '/shop/payment',
      query: { orderId, amount: String(amount), description, retry: '1' },
    })
  }

  async function switchToManual() {
    if (switchingToManual.value) return
    const s = state.value
    if (s.kind === 'switchedToManual') return

    let found: OrderInBase | null = null
    if (hasOrder(s)) found = s.order
    if (!found && paymentId) found = findOrder(paymentId)
    if (!found) {
      router.push('/shop')
      return
    }

    switchingToManual.value = true
    try {
      await api.updateOrderPaymentMethod(String(found.id), 'manual')
      metrics.trackButtonClick('paymentManualSwitch')
      state.value = setSwitchedToManual(state.value, found)
      stopPolling()
      localStorage.removeItem('pendingPaymentId')
      localStorage.removeItem('pendingOrderId')
      await maybeNotifySeller()
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось переключить на ручную оплату'
      useToast().add({ title: message, color: 'red' as 'error' })
    } finally {
      switchingToManual.value = false
    }
  }

  function goToShop() {
    router.push('/shop')
  }

  function goToTracking() {
    router.push('/shop/tracking')
  }

  return {
    state,
    switchingToManual,
    init,
    retryPayment,
    switchToManual,
    goToShop,
    goToTracking,
  }
}
