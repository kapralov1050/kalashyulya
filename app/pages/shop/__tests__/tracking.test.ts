import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrderInBase } from '~/types'
import Tracking from '../tracking.vue'

const searchOrderByNumberMock = vi.fn(
  async (_number: string): Promise<OrderInBase | null> => null,
)

const translations: Record<string, string> = {
  tracking_page_title: 'Отслеживание заказа',
  tracking_page_subtitle: 'Найдите заказ по номеру',
  tracking_payment_id_label: 'Номер заказа',
  tracking_payment_id_placeholder: 'Например, #20260825-04bb9555',
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
  tracking_empty_hint: 'Введите номер заказа, чтобы найти заказ',
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
    id: '20260825-04bb9555',
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
    searchOrderByNumberMock.mockReset()
    searchOrderByNumberMock.mockResolvedValue(null)

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
    vi.stubGlobal('useApi', () => ({
      searchOrderByNumber: searchOrderByNumberMock,
    }))
  })

  describe('search by order number', () => {
    it('находит заказ и маскирует ПД', async () => {
      searchOrderByNumberMock.mockResolvedValueOnce(createMockOrder())
      const wrapper = mountTracking()

      await wrapper.find('input').setValue('#20260825-04bb9555')
      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(searchOrderByNumberMock).toHaveBeenCalledWith('#20260825-04bb9555')

      const text = wrapper.text()
      expect(text).toContain('Заказ #20260825-04bb9555')
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

    it('поиск без `#` тоже работает (нормализация на сервере)', async () => {
      searchOrderByNumberMock.mockResolvedValueOnce(createMockOrder())
      const wrapper = mountTracking()

      await wrapper.find('input').setValue('20260825-04bb9555')
      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(searchOrderByNumberMock).toHaveBeenCalledWith('20260825-04bb9555')
      expect(wrapper.text()).toContain('Заказ #20260825-04bb9555')
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

      expect(wrapper.text()).toContain(
        'Введите номер заказа, чтобы найти заказ',
      )
      expect(wrapper.text()).not.toContain('Заказ #')
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })
  })

  describe('error state', () => {
    it('shows an error when the order number is not found', async () => {
      const wrapper = mountTracking()

      await wrapper.find('input').setValue('missing-order')
      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Ошибка поиска')
      expect(wrapper.text()).toContain('Заказ с таким номером не найден')
      expect(wrapper.text()).not.toContain(
        'Введите номер заказа, чтобы найти заказ',
      )
    })

    it('показывает сообщение о проблемах с соединением при network error', async () => {
      searchOrderByNumberMock.mockRejectedValueOnce(new Error('network down'))
      const wrapper = mountTracking()

      await wrapper.find('input').setValue('#any')
      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Проблемы с соединением')
      expect(toastAddMock).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'error' }),
      )
    })
  })
})
