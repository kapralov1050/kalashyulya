import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PaymentMethodSelector from '../PaymentMethodSelector.vue'

describe('PaymentMethodSelector.vue', () => {
  beforeEach(() => {
    vi.stubGlobal('useLocales', () => ({
      printLocale: (key: string) => {
        const t: Record<string, string> = {
          shop_payment_order_success: 'Заказ оформлен',
          shop_payment_select_method: 'Выберите способ оплаты',
          shop_payment_online_title: 'Онлайн оплата',
          shop_payment_online_desc: 'Через ЮKassa',
          shop_payment_manual_title: 'Перевод вручную',
          shop_payment_manual_desc: 'По реквизитам',
        }
        return t[key] || key
      },
    }))
  })

  const stubs = {
    AnimatedBlob: {
      template: '<div><slot name="heading" /><slot name="description" /><slot name="content" /></div>',
    },
    UIcon: true,
  }

  it('отображает оба способа оплаты', () => {
    const wrapper = mount(PaymentMethodSelector, {
      global: { stubs },
    })

    expect(wrapper.text()).toContain('Онлайн оплата')
    expect(wrapper.text()).toContain('Перевод вручную')
  })

  it('эмитит selectPaymentMethod с "yookassa" при клике на онлайн оплату', async () => {
    const wrapper = mount(PaymentMethodSelector, {
      global: { stubs },
    })

    const options = wrapper.findAll('[class*="border-"]')
    await options[0].trigger('click')

    expect(wrapper.emitted('selectPaymentMethod')).toBeTruthy()
    expect(wrapper.emitted('selectPaymentMethod')?.[0]).toEqual(['yookassa'])
  })

  it('эмитит selectPaymentMethod с "manual" при клике на перевод', async () => {
    const wrapper = mount(PaymentMethodSelector, {
      global: { stubs },
    })

    const options = wrapper.findAll('[class*="border-"]')
    await options[1].trigger('click')

    expect(wrapper.emitted('selectPaymentMethod')).toBeTruthy()
    expect(wrapper.emitted('selectPaymentMethod')?.[0]).toEqual(['manual'])
  })
})
