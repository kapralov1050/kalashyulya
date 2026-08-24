import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PaymentResultNotFound from '../PaymentResultNotFound.vue'

const translations: Record<string, string> = {
  payment_success_status_cancelled: 'Оплата не завершена',
  payment_success_subtitle_not_found: 'Платёж не найден',
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

describe('PaymentResultNotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('показывает иконку ✗', () => {
    const wrapper = mount(PaymentResultNotFound, {
      props: { paymentId: 'p_xyz' },
      global: { stubs },
    })
    expect(wrapper.find('[data-icon="i-heroicons-x-circle"]').exists()).toBe(
      true,
    )
  })

  it('показывает «Платёж не найден»', () => {
    const wrapper = mount(PaymentResultNotFound, {
      props: { paymentId: 'p_xyz' },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Платёж не найден')
  })

  it('эмитит goToShop при клике «В магазин»', async () => {
    const wrapper = mount(PaymentResultNotFound, {
      props: { paymentId: 'p_xyz' },
      global: { stubs },
    })
    const btn = wrapper
      .findAll('button')
      .find(b => b.text().includes('В магазин'))
    expect(btn).toBeDefined()
    await btn!.trigger('click')
    expect(wrapper.emitted('goToShop')).toBeTruthy()
  })

  it('эмитит goToTracking при клике «Отследить заказ»', async () => {
    const wrapper = mount(PaymentResultNotFound, {
      props: { paymentId: 'p_xyz' },
      global: { stubs },
    })
    const btn = wrapper
      .findAll('button')
      .find(b => b.text().includes('Отследить заказ'))
    expect(btn).toBeDefined()
    await btn!.trigger('click')
    expect(wrapper.emitted('goToTracking')).toBeTruthy()
  })

  it('НЕ рендерит OrderDetailsCard', () => {
    const wrapper = mount(PaymentResultNotFound, {
      props: { paymentId: 'p_xyz' },
      global: { stubs },
    })
    expect(wrapper.find('[data-testid="order-details"]').exists()).toBe(false)
  })
})
