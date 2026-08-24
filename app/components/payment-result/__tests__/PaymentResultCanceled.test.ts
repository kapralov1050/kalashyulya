import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrderInBase } from '~/types'
import PaymentResultCanceled from '../PaymentResultCanceled.vue'

const translations: Record<string, string> = {
  payment_success_status_cancelled: 'Оплата не завершена',
  payment_success_subtitle_cancelled: 'Заказ сохранён, но оплата не прошла',
  payment_success_retry_button: 'Попробовать снова',
  payment_success_manual_button: 'Оплатить переводом',
  shop_back_to_shop: 'В магазин',
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
    props: ['disabled', 'loading'],
    template:
      '<button :data-disabled="disabled" :data-loading="loading" @click="$emit(\'click\')"><slot /></button>',
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

function mountCanceled(props: Record<string, unknown> = {}) {
  return mount(PaymentResultCanceled, {
    props: {
      order: createMockOrder(),
      paymentId: 'payment-123',
      switchingToManual: false,
      ...props,
    },
    global: { stubs },
  })
}

describe('PaymentResultCanceled', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('показывает иконку ✗', () => {
    const wrapper = mountCanceled()
    expect(wrapper.find('[data-icon="i-heroicons-x-circle"]').exists()).toBe(
      true,
    )
  })

  it('показывает «Оплата не завершена»', () => {
    const wrapper = mountCanceled()
    expect(wrapper.text()).toContain('Оплата не завершена')
    expect(wrapper.text()).toContain('Заказ сохранён, но оплата не прошла')
  })

  it('эмитит retry при клике «Попробовать снова»', async () => {
    const wrapper = mountCanceled()
    const btn = wrapper
      .findAll('button')
      .find(b => b.text().includes('Попробовать снова'))
    expect(btn).toBeDefined()
    await btn!.trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('эмитит switchToManual при клике «Оплатить переводом»', async () => {
    const wrapper = mountCanceled()
    const btn = wrapper
      .findAll('button')
      .find(b => b.text().includes('Оплатить переводом'))
    expect(btn).toBeDefined()
    await btn!.trigger('click')
    expect(wrapper.emitted('switchToManual')).toBeTruthy()
  })

  it('эмитит goToShop при клике «В магазин»', async () => {
    const wrapper = mountCanceled()
    const btn = wrapper
      .findAll('button')
      .find(b => b.text().includes('В магазин'))
    expect(btn).toBeDefined()
    await btn!.trigger('click')
    expect(wrapper.emitted('goToShop')).toBeTruthy()
  })

  it('НЕТ кнопки «Отследить»', () => {
    const wrapper = mountCanceled()
    const buttons = wrapper.findAll('button').map(b => b.text())
    expect(buttons.some(t => t.includes('Отследить'))).toBe(false)
  })

  it('кнопки retry и manual disabled когда switchingToManual=true', () => {
    const wrapper = mountCanceled({ switchingToManual: true })
    const buttons = wrapper.findAll('button')
    const retryBtn = buttons.find(b => b.text().includes('Попробовать снова'))
    const manualBtn = buttons.find(b => b.text().includes('Оплатить переводом'))
    expect(retryBtn!.attributes('data-disabled')).toBe('true')
    expect(manualBtn!.attributes('data-disabled')).toBe('true')
  })
})
