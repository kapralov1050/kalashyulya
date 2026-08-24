import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrderInBase } from '~/types'
import PaymentResultPending from '../PaymentResultPending.vue'

const translations: Record<string, string> = {
  payment_success_status_pending: 'Ожидается оплата',
  payment_success_subtitle_pending: 'Завершите оплату',
  payment_success_status_check_timed_out: 'Не получили подтверждение',
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

function mountPending(props: Record<string, unknown> = {}) {
  return mount(PaymentResultPending, {
    props: {
      order: createMockOrder(),
      paymentId: 'payment-123',
      timedOut: false,
      switchingToManual: false,
      ...props,
    },
    global: { stubs },
  })
}

describe('PaymentResultPending', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('показывает иконку часов', () => {
    const wrapper = mountPending()
    expect(wrapper.find('[data-icon="i-heroicons-clock"]').exists()).toBe(true)
  })

  it('показывает «Ожидается оплата»', () => {
    const wrapper = mountPending()
    expect(wrapper.text()).toContain('Ожидается оплата')
  })

  it('НЕ показывает текст таймаута когда timedOut=false', () => {
    const wrapper = mountPending({ timedOut: false })
    expect(wrapper.text()).not.toContain('Не получили подтверждение')
  })

  it('показывает текст таймаута когда timedOut=true', () => {
    const wrapper = mountPending({ timedOut: true })
    expect(wrapper.text()).toContain('Не получили подтверждение')
  })

  it('эмитит retry при клике «Попробовать снова»', async () => {
    const wrapper = mountPending()
    const btn = wrapper
      .findAll('button')
      .find(b => b.text().includes('Попробовать снова'))
    expect(btn).toBeDefined()
    await btn!.trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('эмитит switchToManual при клике «Оплатить переводом»', async () => {
    const wrapper = mountPending()
    const btn = wrapper
      .findAll('button')
      .find(b => b.text().includes('Оплатить переводом'))
    expect(btn).toBeDefined()
    await btn!.trigger('click')
    expect(wrapper.emitted('switchToManual')).toBeTruthy()
  })

  it('эмитит goToShop при клике «В магазин»', async () => {
    const wrapper = mountPending()
    const btn = wrapper
      .findAll('button')
      .find(b => b.text().includes('В магазин'))
    expect(btn).toBeDefined()
    await btn!.trigger('click')
    expect(wrapper.emitted('goToShop')).toBeTruthy()
  })

  it('кнопки retry и manual disabled когда switchingToManual=true', () => {
    const wrapper = mountPending({ switchingToManual: true })
    const buttons = wrapper.findAll('button')
    const retryBtn = buttons.find(b => b.text().includes('Попробовать снова'))
    const manualBtn = buttons.find(b => b.text().includes('Оплатить переводом'))
    const shopBtn = buttons.find(b => b.text().includes('В магазин'))

    expect(retryBtn!.attributes('data-disabled')).toBe('true')
    expect(manualBtn!.attributes('data-disabled')).toBe('true')
    expect(shopBtn!.attributes('data-disabled')).toBeUndefined()
  })
})
