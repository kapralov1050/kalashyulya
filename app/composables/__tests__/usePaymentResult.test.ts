import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, defineStore, setActivePinia } from 'pinia'
import { defineComponent, ref, type Ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrderInBase } from '~/types'
import type { PaymentResultState } from '../usePaymentResultState'
import { usePaymentResult } from '../usePaymentResult'

function makeOrder(paymentId = 'payment-123'): OrderInBase {
  return {
    id: 42,
    status: 'Новый заказ',
    paymentId,
    customer: {
      name: 'Иван',
      email: 'ivan@example.com',
      phone: '+79991234567',
      userMessenger: 'Telegram',
      userNickname: '@ivan',
      delivery: {
        type: 'delivery',
        city: 'Москва',
        street: 'Ленина',
        house: '10',
        apartment: '25',
        recipient: 'Иванов И.И.',
      },
    },
    purchase: {
      order: [{ id: 1, title: 'Дождливо. Байкал', amount: 1, price: 5000 }],
      createdAt: '2026-08-23T22:29:00.000Z',
    },
    totalPrice: 5000,
    paymentMethod: 'yookassa',
  }
}

function withSetup(initialPaymentId: Ref<string | null>) {
  let api: ReturnType<typeof usePaymentResult> | null = null

  const Comp = defineComponent({
    setup() {
      api = usePaymentResult(initialPaymentId)
      return () => null
    },
  })

  const wrapper = mount(Comp, {
    global: { plugins: [pinia] },
  })

  return { wrapper, api: () => api! }
}

const getPaymentStatusMock = vi.fn()
const useYookassaPaymentMock = () => ({
  getPaymentStatus: getPaymentStatusMock,
})

const updateOrderPaymentMethodMock = vi.fn()
const notifySellerMock = vi.fn()
const useApiMock = () => ({
  updateOrderPaymentMethod: updateOrderPaymentMethodMock,
  notifySeller: notifySellerMock,
})

const toastAddMock = vi.fn()
const useToastMock = () => ({ add: toastAddMock })

const loadOrdersMock = vi.fn(async () => {})
const useResultOrdersStore = defineStore('payment-result-orders-test', () => {
  const allOrders = ref<OrderInBase[]>([])
  const loadOrders = loadOrdersMock
  return { allOrders, loadOrders }
})

const clearBasketMock = vi.fn()
const useBasketStoreMock = () => ({ clearBasket: clearBasketMock })

const routerPushMock = vi.fn()

let pinia: ReturnType<typeof createPinia>

function installStubs() {
  vi.stubGlobal('useRoute', () => ({ query: {} }))
  vi.stubGlobal('useRouter', () => ({ push: routerPushMock }))
  vi.stubGlobal('useLocales', () => ({
    printLocale: (_key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? _key,
  }))
  vi.stubGlobal('useOrdersStore', useResultOrdersStore)
  vi.stubGlobal('useBasketStore', useBasketStoreMock)
  vi.stubGlobal('useYookassaPayment', useYookassaPaymentMock)
  vi.stubGlobal('useApi', useApiMock)
  vi.stubGlobal('useToast', useToastMock)
  vi.stubGlobal('useSeoMeta', vi.fn())
}

describe('usePaymentResult', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    localStorage.clear()
    getPaymentStatusMock.mockReset()
    loadOrdersMock.mockClear()
    clearBasketMock.mockClear()
    routerPushMock.mockClear()
    updateOrderPaymentMethodMock.mockReset()
    notifySellerMock.mockReset()
    toastAddMock.mockClear()
    installStubs()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('init() без paymentId → state.error', async () => {
    const { wrapper, api } = withSetup(ref(null))

    await api().init()
    await flushPromises()

    const s = api().state.value
    expect(s.kind).toBe('error')
    if (s.kind === 'error') expect(s.message).toContain('Не передан ID платежа')
    expect(getPaymentStatusMock).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('init() + succeeded → state.succeeded + notifySeller + clearBasket', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'succeeded',
      paid: true,
    })
    const store = useResultOrdersStore()
    store.allOrders = [makeOrder()]

    const { wrapper, api } = withSetup(ref('payment-123'))

    await api().init()
    await flushPromises()

    expect(api().state.value.kind).toBe('succeeded')
    expect(notifySellerMock).toHaveBeenCalledWith('42')
    expect(clearBasketMock).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('pendingPaymentId')).toBeNull()

    wrapper.unmount()
  })

  it('init() + pending → state.pending (polling запущен)', async () => {
    vi.useFakeTimers()
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'pending',
      paid: false,
    })
    const store = useResultOrdersStore()
    store.allOrders = [makeOrder()]

    const { wrapper, api } = withSetup(ref('payment-123'))

    await api().init()
    await flushPromises()

    expect(api().state.value.kind).toBe('pending')

    wrapper.unmount()
  })

  it('polling timeout (30 сек) → state.pending.timedOut = true', async () => {
    vi.useFakeTimers()
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'pending',
      paid: false,
    })
    const store = useResultOrdersStore()
    store.allOrders = [makeOrder()]

    const { wrapper, api } = withSetup(ref('payment-123'))

    await api().init()
    await flushPromises()

    let s: PaymentResultState = api().state.value
    expect(s.kind).toBe('pending')
    if (s.kind === 'pending') expect(s.timedOut).toBe(false)

    await vi.advanceTimersByTimeAsync(36_000)
    for (let i = 0; i < 10; i++) await Promise.resolve()
    await flushPromises()

    s = api().state.value
    expect(s.kind).toBe('pending')
    if (s.kind === 'pending') expect(s.timedOut).toBe(true)

    wrapper.unmount()
  })

  it('switchToManual success → state.switchedToManual + notifySeller', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'pending',
      paid: false,
    })
    const store = useResultOrdersStore()
    store.allOrders = [makeOrder()]

    const { wrapper, api } = withSetup(ref('payment-123'))

    await api().init()
    await flushPromises()

    await api().switchToManual()
    await flushPromises()

    expect(updateOrderPaymentMethodMock).toHaveBeenCalledWith('42', 'manual')
    expect(api().state.value.kind).toBe('switchedToManual')
    expect(notifySellerMock).toHaveBeenCalledWith('42')

    wrapper.unmount()
  })

  it('switchToManual error → toast и state не меняется', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'canceled',
      paid: false,
    })
    const store = useResultOrdersStore()
    store.allOrders = [makeOrder()]

    updateOrderPaymentMethodMock.mockRejectedValueOnce(
      new Error('Нельзя сменить способ оплаты'),
    )

    const { wrapper, api } = withSetup(ref('payment-123'))

    await api().init()
    await flushPromises()

    const kindBefore = api().state.value.kind
    await api().switchToManual()
    await flushPromises()

    expect(toastAddMock).toHaveBeenCalledTimes(1)
    expect(toastAddMock.mock.calls[0]?.[0]).toMatchObject({ color: 'red' })
    expect(api().state.value.kind).toBe(kindBefore)
    expect(api().state.value.kind).not.toBe('switchedToManual')

    wrapper.unmount()
  })

  it('повторный init() с тем же paymentId — без второго вызова fetchStatus', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'succeeded',
      paid: true,
    })
    const store = useResultOrdersStore()
    store.allOrders = [makeOrder()]

    const { wrapper, api } = withSetup(ref('payment-123'))

    await api().init()
    const callsAfterFirst = getPaymentStatusMock.mock.calls.length
    await api().init()
    await flushPromises()

    expect(getPaymentStatusMock.mock.calls.length).toBe(callsAfterFirst)

    wrapper.unmount()
  })
})
