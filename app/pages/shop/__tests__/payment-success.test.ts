import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, defineStore, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrderInBase } from '~/types'
import PaymentSuccess from '../payment-success.vue'

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
const usePaymentSuccessOrdersStore = defineStore(
  'payment-success-orders-test',
  () => {
    const allOrders = ref<OrderInBase[]>([])
    const loadOrders = loadOrdersMock
    return { allOrders, loadOrders }
  },
)

const clearBasketMock = vi.fn()
const useBasketStoreMock = () => ({ clearBasket: clearBasketMock })

const routerPushMock = vi.fn()

let pinia: ReturnType<typeof createPinia>

const translations: Record<string, string> = {
  payment_success_loading: 'Проверяем статус оплаты...',
  // payment_success_webhook_waiting удалён: был дублем с subtitle_pending.
  // Во время polling показывается только subtitle + statusTitle.
  payment_success_status_paid: 'Оплата получена',
  payment_success_status_cancelled: 'Оплата не завершена',
  payment_success_status_pending: 'Ожидается оплата',
  payment_success_subtitle_paid: 'Спасибо за заказ!',
  payment_success_subtitle_cancelled: 'Заказ сохранён, но оплата не прошла.',
  payment_success_subtitle_not_found: 'Платёж не найден.',
  payment_success_subtitle_pending:
    'Завершите оплату, чтобы мы начали работу над заказом.',
  payment_success_status_check_timed_out:
    'Не получили подтверждение. Похоже, оплата не была завершена.',
  payment_success_retry_button: 'Попробовать снова',
  payment_success_manual_button: 'Оплатить переводом',
  payment_success_manual_switched_message:
    'Спасибо! Заказ переведён в режим ручной оплаты.',
  payment_success_manual_switched_hint:
    'Реквизиты для перевода в Telegram-чате.',
  payment_success_order_payment_description: 'Оплата заказа #{orderId}',
  payment_success_date_not_specified: 'Не указана',
  payment_success_no_payment_id_error:
    'Не передан ID платежа. Перейдите по ссылке из письма или напишите мне в Telegram @kalashyulya.',
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

function mountPaymentSuccess(
  routeQuery: Record<string, string> = {},
  pendingPaymentId: string | null = 'payment-123',
) {
  if (pendingPaymentId) {
    localStorage.setItem('pendingPaymentId', pendingPaymentId)
  } else {
    localStorage.removeItem('pendingPaymentId')
  }

  vi.stubGlobal('useRoute', () => ({ query: routeQuery }))
  vi.stubGlobal('useRouter', () => ({ push: routerPushMock }))
  vi.stubGlobal('useLocales', () => ({
    printLocale: (
      key: string,
      options?: {
        params?: Record<string, string | number>
        defaultValue?: string
      },
    ) => {
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
  vi.stubGlobal('useApi', useApiMock)
  vi.stubGlobal('useToast', useToastMock)
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
    updateOrderPaymentMethodMock.mockReset()
    notifySellerMock.mockReset()
    toastAddMock.mockClear()
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
    // B1 фикс: immediate succeeded (без polling) тоже вызывает notifySeller,
    // иначе продавец никогда не узнает о заказе.
    expect(notifySellerMock).toHaveBeenCalledWith('42')
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

    const retryButton = wrapper
      .findAll('button')
      .find(b => b.text().includes('Попробовать снова'))
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

  it('для pending сразу показывает «Ожидается оплата» и не очищает корзину', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'pending',
      paid: false,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder()]

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    expect(wrapper.text()).toContain('Ожидается оплата')
    expect(wrapper.text()).toContain('Завершите оплату')
    expect(clearBasketMock).not.toHaveBeenCalled()

    // Гарантируем остановку polling-таймера, чтобы он не флакал другие тесты.
    wrapper.unmount()
  })

  it('для pending показывает кнопки «Попробовать снова» и «В магазин»', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'pending',
      paid: false,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder()]

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    const buttons = wrapper.findAll('button').map(b => b.text())
    expect(buttons.some(t => t.includes('Попробовать снова'))).toBe(true)
    expect(buttons.some(t => t.includes('В магазин'))).toBe(true)
    // Кнопка «Проверить снова» удалена — её не должно быть.
    expect(buttons.some(t => t.includes('Проверить снова'))).toBe(false)

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

  it('после таймаута polling (30 сек) текст меняется на «Не получили подтверждение»', async () => {
    vi.useFakeTimers()
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'pending',
      paid: false,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder()]

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    // До таймаута: доп. текст с webhook_waiting НЕ показывается (его удалили,
    // он был дублем с subtitle_pending). Показываются только statusTitle +
    // subtitle.
    expect(wrapper.text()).not.toContain('Не получили подтверждение')

    // 7 тиков × 5 сек = 35 сек (после 6-го pollingAttempts = 6, 7-й > 6 → timedOut)
    await vi.advanceTimersByTimeAsync(36_000)
    // Даём микротаскам (внутри callback — await getPaymentStatus) завершиться
    for (let i = 0; i < 10; i++) await Promise.resolve()
    await flushPromises()

    expect(wrapper.text()).toContain('Не получили подтверждение.')
    expect(wrapper.text()).not.toContain(
      'Подождите, проверяем статус оплаты...',
    )

    wrapper.unmount()
    vi.useRealTimers()
  })

  it('fallback defaultValue из printLocale когда ключ отсутствует в локали', async () => {
    // Временно убираем ключи, чтобы printLocale вернул defaultValue.
    // Восстанавливаем в finally, чтобы не сломать последующие тесты.
    const savedPaid = translations.payment_success_status_paid as string
    const savedPaidSub = translations.payment_success_subtitle_paid as string
    delete translations.payment_success_status_paid
    delete translations.payment_success_subtitle_paid

    try {
      getPaymentStatusMock.mockResolvedValue({
        success: true,
        status: 'succeeded',
        paid: true,
      })

      const ordersStore = usePaymentSuccessOrdersStore()
      ordersStore.allOrders = [createMockOrder()]

      const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
      await flushPromises()

      // Из defaultValue в payment-success.vue
      expect(wrapper.text()).toContain('Оплата получена')
      expect(wrapper.text()).toContain('Спасибо за заказ!')

      wrapper.unmount()
    } finally {
      translations.payment_success_status_paid = savedPaid
      translations.payment_success_subtitle_paid = savedPaidSub
    }
  })

  it('для pending показывает кнопку «Оплатить переводом»', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'pending',
      paid: false,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder()]

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    const buttons = wrapper.findAll('button').map(b => b.text())
    expect(buttons.some(t => t.includes('Оплатить переводом'))).toBe(true)

    wrapper.unmount()
  })

  it('клик «Оплатить переводом» вызывает updateOrderPaymentMethod и показывает подтверждение', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'pending',
      paid: false,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder()]

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    const manualButton = wrapper
      .findAll('button')
      .find(b => b.text().includes('Оплатить переводом'))
    expect(manualButton).toBeDefined()
    await manualButton!.trigger('click')
    await flushPromises()

    expect(updateOrderPaymentMethodMock).toHaveBeenCalledWith('42', 'manual')

    // После успеха — кнопки скрыты, показан блок подтверждения
    const buttons = wrapper.findAll('button').map(b => b.text())
    expect(buttons.some(t => t.includes('Попробовать снова'))).toBe(false)
    expect(buttons.some(t => t.includes('Оплатить переводом'))).toBe(false)
    expect(wrapper.text()).toContain('Заказ переведён в режим ручной оплаты')

    // localStorage очищен
    expect(localStorage.getItem('pendingPaymentId')).toBeNull()
    expect(localStorage.getItem('pendingOrderId')).toBeNull()

    wrapper.unmount()
  })

  it('ошибка API при «Оплатить переводом» показывает toast и НЕ скрывает кнопки', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'canceled',
      paid: false,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder()]

    updateOrderPaymentMethodMock.mockRejectedValueOnce(
      new Error('Нельзя сменить способ оплаты'),
    )

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    const manualButton = wrapper
      .findAll('button')
      .find(b => b.text().includes('Оплатить переводом'))
    await manualButton!.trigger('click')
    await flushPromises()

    expect(updateOrderPaymentMethodMock).toHaveBeenCalledWith('42', 'manual')
    expect(toastAddMock).toHaveBeenCalledTimes(1)
    expect(toastAddMock.mock.calls[0]?.[0]).toMatchObject({ color: 'red' })

    // Кнопки остались на месте
    const buttons = wrapper.findAll('button').map(b => b.text())
    expect(buttons.some(t => t.includes('Попробовать снова'))).toBe(true)
    expect(buttons.some(t => t.includes('Оплатить переводом'))).toBe(true)
    expect(wrapper.text()).not.toContain(
      'Заказ переведён в режим ручной оплаты',
    )

    wrapper.unmount()
  })

  it('работает с orderId-строкой (как в реальных SQLite-заказах)', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'pending',
      paid: false,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder('payment-123')]
    ordersStore.allOrders[0]!.id = '20260824-abc12345' // string id, как в реальной БД

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    const manualButton = wrapper
      .findAll('button')
      .find(b => b.text().includes('Оплатить переводом'))
    await manualButton!.trigger('click')
    await flushPromises()

    expect(updateOrderPaymentMethodMock).toHaveBeenCalledWith(
      '20260824-abc12345',
      'manual',
    )

    wrapper.unmount()
  })

  it('«Оплатить переводом» → вызывает notifySeller с правильным orderId', async () => {
    getPaymentStatusMock.mockResolvedValue({
      success: true,
      status: 'pending',
      paid: false,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder()]

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    const manualButton = wrapper
      .findAll('button')
      .find(b => b.text().includes('Оплатить переводом'))
    await manualButton!.trigger('click')
    await flushPromises()

    // Уведомление продавцу (email + Telegram) после успешного switchToManual —
    // с актуальным payment_method='manual' (который БД хранит).
    expect(notifySellerMock).toHaveBeenCalledWith('42')

    wrapper.unmount()
  })

  it('«succeeded» от ЮKassa → вызывает notifySeller', async () => {
    vi.useFakeTimers()

    // Первый polling tick → pending
    getPaymentStatusMock.mockResolvedValueOnce({
      success: true,
      status: 'pending',
      paid: false,
    })

    const ordersStore = usePaymentSuccessOrdersStore()
    ordersStore.allOrders = [createMockOrder()]

    const wrapper = mountPaymentSuccess({ paymentId: 'payment-123' })
    await flushPromises()

    expect(notifySellerMock).not.toHaveBeenCalled()

    // Следующий polling tick → succeeded
    getPaymentStatusMock.mockResolvedValueOnce({
      success: true,
      status: 'succeeded',
      paid: true,
    })

    // Прокрутим 5 секунд (один polling tick)
    await vi.advanceTimersByTimeAsync(5_500)
    for (let i = 0; i < 10; i++) await Promise.resolve()
    await flushPromises()

    expect(notifySellerMock).toHaveBeenCalledWith('42')

    wrapper.unmount()
    vi.useRealTimers()
  })
})
