import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, defineStore, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrderInBase } from '~/types'
import PaymentSuccess from '../payment-success.vue'

const getPaymentStatusMock = vi.fn()
const useYookassaPaymentMock = () => ({ getPaymentStatus: getPaymentStatusMock })

const loadOrdersMock = vi.fn(async () => {})
const usePaymentSuccessOrdersStore = defineStore('payment-success-orders-test', () => {
  const allOrders = ref<OrderInBase[]>([])
  const loadOrders = loadOrdersMock
  return { allOrders, loadOrders }
})

const clearBasketMock = vi.fn()
const useBasketStoreMock = () => ({ clearBasket: clearBasketMock })

const routerPushMock = vi.fn()

let pinia: ReturnType<typeof createPinia>

const translations: Record<string, string> = {
  payment_success_loading: 'Проверяем статус оплаты...',
  payment_success_webhook_waiting: 'Ожидаем подтверждения от платёжной системы',
  payment_success_status_paid: 'Оплата получена',
  payment_success_status_cancelled: 'Оплата не завершена',
  payment_success_status_pending: 'Ожидаем подтверждения оплаты',
  payment_success_subtitle_paid: 'Спасибо за заказ!',
  payment_success_subtitle_cancelled: 'Заказ сохранён, но оплата не прошла.',
  payment_success_subtitle_not_found: 'Платёж не найден.',
  payment_success_subtitle_pending: 'Платёж в обработке...',
  payment_success_retry_button: 'Попробовать снова',
  payment_success_order_payment_description: 'Оплата заказа #{orderId}',
  payment_success_date_not_specified: 'Не указана',
  payment_success_no_payment_id_error: 'Не передан ID платежа',
  payment_success_status_check_failed: 'Не удалось проверить статус платежа',
  payment_success_tracking_number_label: 'Номер для отслеживания',
  payment_success_save_hint: 'Сохраните этот номер',
  payment_success_details_title: 'Детали заказа',
  payment_success_payment_sum_label: 'Сумма оплаты',
  payment_success_order_date_label: 'Дата заказа',
  order_goods_label: 'Товары',
  order_delivery_method_label: 'Доставка',
  order_delivery: 'Доставка',
  order_pickup: 'Самовывоз',
  shop_back_to_shop: 'В магазин',
  shop_tracking_link: 'Отследить заказ',
  tracking_error_title: 'Ошибка',
  payment_success_contact_text: 'Я свяжусь с вами',
}

const stubs = {
  UButton: {
    emits: ['click'],
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  },
  UIcon: {
    props: ['name'],
    template: '<span :data-icon="name" />',
  },
}

function createMockOrder(paymentId = 'payment-123'): OrderInBase {
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

function mountPaymentSuccess(routeQuery: Record<string, string> = {}, pendingPaymentId: string | null = 'payment-123') {
  if (pendingPaymentId) {
    localStorage.setItem('pendingPaymentId', pendingPaymentId)
  } else {
    localStorage.removeItem('pendingPaymentId')
  }

  vi.stubGlobal('useRoute', () => ({ query: routeQuery }))
  vi.stubGlobal('useRouter', () => ({ push: routerPushMock }))
  vi.stubGlobal('useLocales', () => ({
    printLocale: (key: string, options?: { params?: Record<string, string | number>, defaultValue?: string }) => {
      const value = translations[key] || options?.defaultValue || key
      if (options?.params) {
        return Object.entries(options.params).reduce(
          (acc, [k, v]) => acc.replace(new RegExp(`{${k}}`, 'g'), String(v)),
          value,
        )
      }
      return value
    },
  }))
  vi.stubGlobal('useOrdersStore', usePaymentSuccessOrdersStore)
  vi.stubGlobal('useBasketStore', useBasketStoreMock)
  vi.stubGlobal('useYookassaPayment', useYookassaPaymentMock)
  vi.stubGlobal('useSeoMeta', vi.fn())

  // Pinia уже активна из beforeEach — используем её,
  // чтобы компонент и тест видели один и тот же store.
  return mount(PaymentSuccess, {
    global: {
      plugins: [pinia],
      stubs,
    },
  })
}

describe('payment-success', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    localStorage.clear()
    getPaymentStatusMock.mockReset()
    loadOrdersMock.mockClear()
    clearBasketMock.mockClear()
    routerPushMock.mockClear()
  })

  it('запрашивает статус в ЮKassa и загружает список заказов при монтировании', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'succeeded',
      paid: true,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder()]

    mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    expect(getPaymentStatusMock).toHaveBeenCalledWith('payment-123')
    expect(loadOrdersMock).toHaveBeenCalled()
  })

  it('показывает «Оплата получена» для succeeded и очищает корзину', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'succeeded',
      paid: true,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder()]

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    expect(wrapper.text()).toContain('Оплата получена')
    expect(wrapper.text()).toContain('Спасибо за заказ!')
    expect(clearBasketMock).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('pendingPaymentId')).toBeNull()
  })

  it('показывает «Оплата не завершена» для canceled и НЕ очищает корзину', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'canceled',
      paid: false,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder()]

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    expect(wrapper.text()).toContain('Оплата не завершена')
    expect(wrapper.text()).toContain('Заказ сохранён, но оплата не прошла')
    expect(clearBasketMock).not.toHaveBeenCalled()
    expect(localStorage.getItem('pendingPaymentId')).toBeNull()
  })

  it('для canceled показывает кнопку «Попробовать снова» и редиректит на /shop/payment с retry=1', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'canceled',
      paid: false,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder()]

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    expect(wrapper.text()).toContain('Попробовать снова')

    const retryButton = wrapper.findAll('button').find(b => b.text().includes('Попробовать снова'))
    expect(retryButton).toBeDefined()
    await retryButton!.trigger('click')

    expect(routerPushMock).toHaveBeenCalledWith({
      path: '/shop/payment',
      query: {
        orderId: '42',
        amount: '5000',
        description: 'Оплата заказа #42',
        retry: '1',
      },
    })
  })

  it('для not_found показывает ошибку и ссылки в магазин/трекинг', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'not_found',
    })

    const wrapper = mountPaymentSuccess({ paymentId: 'missing' })
    await flushPromises()

    expect(wrapper.text()).toContain('Платёж не найден.')
    expect(wrapper.text()).toContain('В магазин')
  })

  it('без paymentId в query и в localStorage сразу показывает ошибку без обращения к ЮKassa', async () => {
    const wrapper = mountPaymentSuccess({}, null)
    await flushPromises()

    expect(getPaymentStatusMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Не передан ID платежа')
  })

  it('берёт paymentId из localStorage если в query его нет', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'succeeded',
      paid: true,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder('stored-payment-id')]

    mountPaymentSuccess({}, 'stored-payment-id')
    await flushPromises()

    expect(getPaymentStatusMock).toHaveBeenCalledWith('stored-payment-id')
  })

  it('для pending сразу показывает «Ожидаем подтверждения» и не очищает корзину', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'pending',
      paid: false,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder()]

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    expect(wrapper.text()).toContain('Ожидаем подтверждения оплаты')
    expect(clearBasketMock).not.toHaveBeenCalled()

    // Гарантируем остановку polling-таймера, чтобы он не флакал другие тесты.
    wrapper.unmount()
  })

  it('обрабатывает сетевую ошибку от getPaymentStatus: показывает «Не удалось проверить статус»', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: false,
      error: 'Проблемы с соединением',
    })

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    expect(wrapper.text()).toContain('Проблемы с соединением')
  })
})