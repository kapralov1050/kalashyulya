import { defineStore } from 'pinia'

export const useCheckoutStore = defineStore('checkout', () => {
  const form = reactive({
    name: '',
    email: '',
    phone: '',
    nickname: '',
    messengers: [] as string[],
    deliveryType: 'pickup' as 'pickup' | 'delivery',
    recipient: '',
    address: '',
    region: '',
    city: '',
    framing: '' as '' | 'none' | 'simple' | 'premium',
    payment: '' as '' | 'yookassa' | 'manual',
  })

  function reset() {
    form.name = ''
    form.email = ''
    form.phone = ''
    form.nickname = ''
    form.messengers = []
    form.deliveryType = 'pickup'
    form.recipient = ''
    form.address = ''
    form.region = ''
    form.city = ''
    form.framing = ''
    form.payment = ''
  }

  return { form, reset }
})
