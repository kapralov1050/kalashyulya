import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PaymentResultSwitchedToManual from '../PaymentResultSwitchedToManual.vue'

const translations: Record<string, string> = {
  payment_success_manual_switched_message:
    'Заказ переведён в режим ручной оплаты',
  payment_success_manual_switched_hint: 'Реквизиты в Telegram',
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
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  },
  UIcon: {
    props: ['name'],
    template: '<span :data-icon="name" />',
  },
}

describe('PaymentResultSwitchedToManual', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('показывает иконку ✓ зелёную', () => {
    const wrapper = mount(PaymentResultSwitchedToManual, {
      props: { orderId: 42 },
      global: { stubs },
    })
    expect(
      wrapper.find('[data-icon="i-heroicons-check-circle"]').exists(),
    ).toBe(true)
  })

  it('показывает сообщение и подсказку про ручную оплату', () => {
    const wrapper = mount(PaymentResultSwitchedToManual, {
      props: { orderId: 42 },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Заказ переведён в режим ручной оплаты')
    expect(wrapper.text()).toContain('Реквизиты в Telegram')
  })

  it('эмитит goToShop при клике «В магазин»', async () => {
    const wrapper = mount(PaymentResultSwitchedToManual, {
      props: { orderId: 42 },
      global: { stubs },
    })
    const btn = wrapper
      .findAll('button')
      .find(b => b.text().includes('В магазин'))
    expect(btn).toBeDefined()
    await btn!.trigger('click')
    expect(wrapper.emitted('goToShop')).toBeTruthy()
  })

  it('рендерится без orderId (опциональный проп)', () => {
    const wrapper = mount(PaymentResultSwitchedToManual, {
      global: { stubs },
    })
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toContain('Заказ переведён в режим ручной оплаты')
  })
})
