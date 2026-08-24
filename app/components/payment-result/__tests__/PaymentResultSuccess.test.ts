import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrderInBase } from '~/types'
import PaymentResultSuccess from '../PaymentResultSuccess.vue'

const translations: Record<string, string> = {
  payment_success_status_paid: 'Оплата получена',
  payment_success_subtitle_paid: 'Спасибо за заказ!',
  payment_success_tracking_number_label: 'Номер для отслеживания',
  payment_success_save_hint: 'Сохраните этот номер',
  payment_success_contact_text: 'Я свяжусь с вами',
  shop_back_to_shop: 'В магазин',
  shop_tracking_link: 'Отследить заказ',
}

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

const stubs = {
  UButton: {
    emits: ['click'],
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  },
  UIcon: {
    props: ['name'],
    template: '<span :data-icon="name" />',
  },
  OrderDetailsCard: { template: '<div data-testid="order-details" />' },
}

function createMockOrder(overrides: Partial<OrderInBase> = {}): OrderInBase {
  return {
    id: 42,
    status: 'Новый заказ',
    paymentId: 'payment-123',
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
    ...overrides,
  }
}

describe('PaymentResultSuccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('показывает иконку ✓', () => {
    const wrapper = mount(PaymentResultSuccess, {
      props: { order: createMockOrder() },
      global: { stubs },
    })
    expect(
      wrapper.find('[data-icon="i-heroicons-check-circle"]').exists(),
    ).toBe(true)
  })

  it('показывает заголовок «Оплата получена»', () => {
    const wrapper = mount(PaymentResultSuccess, {
      props: { order: createMockOrder() },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Оплата получена')
  })

  it('эмитит navigate-to-shop при клике «В магазин»', async () => {
    const wrapper = mount(PaymentResultSuccess, {
      props: { order: createMockOrder() },
      global: { stubs },
    })
    const btn = wrapper
      .findAll('button')
      .find(b => b.text().includes('В магазин'))
    expect(btn).toBeDefined()
    await btn!.trigger('click')
    expect(wrapper.emitted('navigate-to-shop')).toBeTruthy()
    expect(wrapper.emitted('navigate-to-shop')).toHaveLength(1)
  })

  it('эмитит navigate-to-tracking при клике «Отследить заказ»', async () => {
    const wrapper = mount(PaymentResultSuccess, {
      props: { order: createMockOrder() },
      global: { stubs },
    })
    const btn = wrapper
      .findAll('button')
      .find(b => b.text().includes('Отследить заказ'))
    expect(btn).toBeDefined()
    await btn!.trigger('click')
    expect(wrapper.emitted('navigate-to-tracking')).toBeTruthy()
  })

  it('показывает бейдж «Номер для отслеживания» если paymentId есть', () => {
    const wrapper = mount(PaymentResultSuccess, {
      props: { order: createMockOrder({ paymentId: 'p_xyz' }) },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Номер для отслеживания')
    expect(wrapper.text()).toContain('p_xyz')
  })

  it('НЕ показывает блок с деталями если order=null', () => {
    const wrapper = mount(PaymentResultSuccess, {
      props: { order: null },
      global: { stubs },
    })
    expect(wrapper.find('[data-testid="order-details"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Номер для отслеживания')
  })

  it('рендерит OrderDetailsCard когда order передан', () => {
    const wrapper = mount(PaymentResultSuccess, {
      props: { order: createMockOrder() },
      global: { stubs },
    })
    expect(wrapper.find('[data-testid="order-details"]').exists()).toBe(true)
  })
})
