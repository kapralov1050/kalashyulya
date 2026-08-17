import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, defineStore, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrderInBase } from '~/types'
import Tracking from '../tracking.vue'

const useTrackingOrdersStore = defineStore('tracking-orders-test', () => {
  const allOrders = ref<OrderInBase[]>([])

  return { allOrders }
})

const translations: Record<string, string> = {
  tracking_page_title: 'Отслеживание заказа',
  tracking_page_subtitle: 'Найдите заказ по ID платежа',
  tracking_payment_id_label: 'ID платежа',
  tracking_payment_id_placeholder: 'Введите ID платежа',
  tracking_find: 'Найти',
  tracking_searching: 'Поиск',
  tracking_loading: 'Загрузка',
  tracking_error_title: 'Ошибка поиска',
  tracking_retry: 'Попробовать снова',
  tracking_status_label: 'Статус',
  order_details_title: 'Детали заказа',
  order_goods_label: 'Товары',
  order_sum_label: 'Сумма',
  order_date_label: 'Дата',
  order_delivery_method_label: 'Доставка',
  tracking_customer_info_title: 'Информация о клиенте',
  tracking_customer_name_label: 'Имя',
  tracking_customer_email_label: 'Email',
  tracking_customer_phone_label: 'Телефон',
  tracking_customer_contact_label: 'Способ связи',
  tracking_delivery_address_title: 'Адрес доставки',
  tracking_city_label: 'Город:',
  tracking_street_label: 'Улица:',
  tracking_house_label: 'Дом:',
  tracking_apartment_label: 'Квартира:',
  tracking_recipient_label: 'Получатель:',
  tracking_find_other: 'Найти другой заказ',
  tracking_empty_hint: 'Введите ID платежа, чтобы найти заказ',
}

const stubs = {
  UButton: {
    props: ['disabled'],
    emits: ['click'],
    template:
      '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  },
  UAlert: {
    props: ['title'],
    template:
      '<div role="alert"><span>{{ title }}</span><slot name="description" /></div>',
  },
  UIcon: {
    template: '<span />',
  },
}

let attempts = ref(0)
let isBlocked = ref(false)
let remainingTimeMs = ref(0)
let recordAttemptMock = vi.fn()
let toastAddMock = vi.fn()
let pinia: ReturnType<typeof createPinia>

function createMockOrder(): OrderInBase {
  return {
    id: 42,
    status: 'Оплачен',
    paymentId: 'payment-123',
    customer: {
      name: 'Иван Иванов',
      email: 'ivan.petrov@example.com',
      phone: '+7 999 123-45-67',
      userMessenger: 'Telegram',
      userNickname: '@ivan_petrov',
      delivery: {
        type: 'delivery',
        city: 'Москва',
        street: 'Ленина',
        house: '10',
        apartment: '25',
        recipient: 'Иванов Иван Иванович',
      },
    },
    purchase: {
      order: [{ id: 1, title: 'Акварель', amount: 1, price: 5000 }],
      createdAt: '2026-07-20T12:00:00.000Z',
    },
    totalPrice: 5000,
    paymentMethod: 'yookassa',
  }
}

function mountTracking() {
  return mount(Tracking, {
    global: {
      plugins: [pinia],
      stubs,
    },
  })
}

describe('tracking', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    localStorage.clear()

    attempts = ref(0)
    isBlocked = ref(false)
    remainingTimeMs = ref(0)
    recordAttemptMock = vi.fn()
    toastAddMock = vi.fn()

    vi.stubGlobal('useOrdersStore', useTrackingOrdersStore)
    vi.stubGlobal('useLocales', () => ({
      printLocale: (key: string) => translations[key] || key,
    }))
    vi.stubGlobal('useRateLimit', () => ({
      attempts,
      isBlocked,
      remainingTimeMs,
      recordAttempt: recordAttemptMock,
    }))
    vi.stubGlobal('useToast', () => ({ add: toastAddMock }))
    vi.stubGlobal('useRouter', () => ({ push: vi.fn() }))
    vi.stubGlobal('useRoute', () => ({ query: {} }))
    vi.stubGlobal('useSeoMeta', vi.fn())
  })

  describe('masking', () => {
    it('masks customer data in the displayed order', async () => {
      const ordersStore = useTrackingOrdersStore()
      ordersStore.allOrders = [createMockOrder()]
      const wrapper = mountTracking()

      await wrapper.find('input').setValue('payment-123')
      await wrapper.find('button').trigger('click')
      await flushPromises()

      const text = wrapper.text()
      expect(text).toContain('Заказ #42')
      expect(text).toContain('Иван И.')
      expect(text).toContain('i***@***.com')
      expect(text).toContain('+7 *** ***-**-67')
      expect(text).toContain('@i***')
      expect(text).toContain('Л***')
      expect(text).toContain('И*** И*** И***')
      expect(text).not.toContain('ivan.petrov@example.com')
      expect(text).not.toContain('+7 999 123-45-67')
      expect(text).not.toContain('@ivan_petrov')
      expect(text).not.toContain('Иванов Иван Иванович')
      expect(recordAttemptMock).toHaveBeenCalledOnce()
    })
  })

  describe('rate-limit', () => {
    it('disables input and shows the blocked alert', () => {
      attempts.value = 5
      isBlocked.value = true
      remainingTimeMs.value = 125000

      const wrapper = mountTracking()
      const input = wrapper.find('input')
      const alert = wrapper.find('[role="alert"]')

      expect(input.attributes('disabled')).toBeDefined()
      expect(alert.exists()).toBe(true)
      expect(alert.text()).toContain('Поиск временно заблокирован')
      expect(alert.text()).toContain('через 2 мин 5 сек')
    })
  })

  describe('empty state', () => {
    it('shows the empty hint when no order is selected', () => {
      const wrapper = mountTracking()

      expect(wrapper.text()).toContain('Введите ID платежа, чтобы найти заказ')
      expect(wrapper.text()).not.toContain('Заказ #')
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })
  })

  describe('error state', () => {
    it('shows an error when the payment ID is not found', async () => {
      const wrapper = mountTracking()

      await wrapper.find('input').setValue('missing-payment')
      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Ошибка поиска')
      expect(wrapper.text()).toContain('Заказ с таким ID не найден')
      expect(wrapper.text()).not.toContain('Введите ID платежа, чтобы найти заказ')
    })
  })
})
