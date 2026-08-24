import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PaymentResultError from '../PaymentResultError.vue'

const translations: Record<string, string> = {
  tracking_error_title: 'Ошибка',
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
}

describe('PaymentResultError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('показывает заголовок «Ошибка»', () => {
    const wrapper = mount(PaymentResultError, {
      props: { message: 'Что-то пошло не так' },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Ошибка')
  })

  it('показывает переданное сообщение', () => {
    const wrapper = mount(PaymentResultError, {
      props: { message: 'Custom error message' },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Custom error message')
  })

  it('показывает иконку ✗', () => {
    const wrapper = mount(PaymentResultError, {
      props: { message: 'msg' },
      global: { stubs },
    })
    expect(wrapper.find('[data-icon="i-heroicons-x-circle"]').exists()).toBe(
      true,
    )
  })

  it('эмитит goToShop при клике «В магазин»', async () => {
    const wrapper = mount(PaymentResultError, {
      props: { message: 'msg' },
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
    const wrapper = mount(PaymentResultError, {
      props: { message: 'msg' },
      global: { stubs },
    })
    const btn = wrapper
      .findAll('button')
      .find(b => b.text().includes('Отследить заказ'))
    expect(btn).toBeDefined()
    await btn!.trigger('click')
    expect(wrapper.emitted('goToTracking')).toBeTruthy()
  })
})
