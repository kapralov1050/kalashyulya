import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrderInBase } from '~/types'
import OrderDetailsCard from '../OrderDetailsCard.vue'

const translations: Record<string, string> = {
  payment_success_details_title: 'Детали заказа',
  payment_success_payment_sum_label: 'Сумма оплаты',
  payment_success_order_date_label: 'Дата заказа',
  payment_success_date_not_specified: 'Не указана',
  order_goods_label: 'Товары',
  order_delivery_method_label: 'Способ доставки',
  order_delivery: 'Доставка',
  order_pickup: 'Самовывоз',
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
  UIcon: {
    props: ['name'],
    template: '<span :data-icon="name" />',
  },
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

describe('OrderDetailsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('показывает заголовок «Детали заказа»', () => {
    const wrapper = mount(OrderDetailsCard, {
      props: { order: createMockOrder() },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Детали заказа')
  })

  it('показывает товары с × amount только при amount > 1', () => {
    const wrapper = mount(OrderDetailsCard, {
      props: {
        order: createMockOrder({
          purchase: {
            order: [
              { id: 1, title: 'Картина 1', amount: 1, price: 1000 },
              { id: 2, title: 'Картина 2', amount: 3, price: 2000 },
            ],
            createdAt: '2026-08-23T22:29:00.000Z',
          },
        }),
      },
      global: { stubs },
    })
    const text = wrapper.text()
    expect(text).toContain('Картина 1')
    expect(text).toContain('Картина 2')
    expect(text).toContain('× 3')
    expect(text).not.toMatch(/Картина 1\s*×/)
  })

  it('форматирует цену через Intl.NumberFormat ru-RU', () => {
    const wrapper = mount(OrderDetailsCard, {
      props: { order: createMockOrder({ totalPrice: 5000 }) },
      global: { stubs },
    })
    expect(wrapper.text()).toMatch(/5\s*000/)
  })

  it('показывает «Доставка» если указан street', () => {
    const wrapper = mount(OrderDetailsCard, {
      props: { order: createMockOrder() },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Доставка')
    expect(wrapper.text()).not.toContain('Самовывоз')
  })

  it('показывает «Самовывоз» если street пустой', () => {
    const wrapper = mount(OrderDetailsCard, {
      props: {
        order: createMockOrder({
          customer: {
            name: 'Иван',
            email: 'ivan@example.com',
            phone: '+79991234567',
            userMessenger: 'Telegram',
            userNickname: '@ivan',
            delivery: {
              type: 'pickup',
              city: 'Москва',
              recipient: 'Иванов И.И.',
            },
          },
        }),
      },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Самовывоз')
    expect(wrapper.text()).not.toContain('Доставка')
  })

  it('форматирует дату как dd.mm.yyyy, hh:mm', () => {
    const wrapper = mount(OrderDetailsCard, {
      props: { order: createMockOrder() },
      global: { stubs },
    })
    expect(wrapper.text()).toMatch(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/)
  })

  it('показывает «Не указана» если createdAt пустая', () => {
    const wrapper = mount(OrderDetailsCard, {
      props: {
        order: createMockOrder({
          purchase: { order: [], createdAt: '' },
        }),
      },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Не указана')
  })
})
