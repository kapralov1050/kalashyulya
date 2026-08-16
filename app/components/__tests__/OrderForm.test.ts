import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import OrderForm from '../OrderForm.vue'
import type { OrderFormVmInstance } from '~/types/test'
import { getVm } from '~/utils/test-helpers'

const { mockAddNewOrder } = vi.hoisted(() => ({
  mockAddNewOrder: vi.fn().mockResolvedValue('order_123'),
}))

vi.mock('~/composables/firebase/useFirebase', () => ({
  useFirebase: () => ({
    shopData: ref(null),
    ordersData: ref(null),
    isLoading: ref(false),
    addNewOrder: mockAddNewOrder,
  }),
}))

const globalStubs = {
  UForm: { template: '<form @submit.prevent><slot /></form>' },
  UFormField: { template: '<div><slot /></div>' },
  UInput: { template: '<input />' },
  UCheckboxGroup: { template: '<div />' },
  UButton: { template: '<button><slot /></button>' },
  UTextarea: { template: '<textarea />' },
  UBadge: true,
  UDivider: true,
  UIcon: true,
}

describe('OrderForm — isFormValid', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('useLocales', () => ({ printLocale: (key: string) => key }))
  })

  function mountForm() {
    return mount(OrderForm, { global: { stubs: globalStubs } })
  }

  it('невалидна при пустой форме', () => {
    const wrapper = mountForm()
    expect(getVm<OrderFormVmInstance>(wrapper).isFormValid).toBeFalsy()
  })

  it('невалидна если есть имя и email, но не выбран мессенджер', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    expect(vm.isFormValid).toBeFalsy()
  })

  it('невалидна если выбран Телеграм, но не заполнен никнейм', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    expect(vm.isFormValid).toBeFalsy()
  })

  it('валидна с именем, email и Телеграм + никнейм', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    vm.formData.nickname = '@ivan'
    expect(vm.isFormValid).toBeTruthy()
  })

  it('невалидна если выбран Звонок, но не заполнен телефон', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Звонок']
    expect(vm.isFormValid).toBeFalsy()
  })

  it('валидна с именем, email и Звонок + телефон', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Звонок']
    vm.formData.phone = '+79001234567'
    expect(vm.isFormValid).toBeTruthy()
  })

  it('невалидна с доставкой если не заполнен город', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    vm.formData.nickname = '@ivan'
    vm.isDelivery = true
    expect(vm.isFormValid).toBeFalsy()
  })

  it('валидна с доставкой если заполнены все поля', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    vm.formData.nickname = '@ivan'
    vm.isDelivery = true
    vm.formData.city = 'Москва'
    vm.formData.recipient = 'Иван Иванов'
    vm.formData.street = 'Ленина'
    vm.formData.house = '1'
    expect(vm.isFormValid).toBeTruthy()
  })

  it('невалидна если имя состоит только из тире', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = '-'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    vm.formData.nickname = '@ivan'
    expect(vm.isFormValid).toBeFalsy()
  })

  it('невалидна если никнейм состоит только из тире', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    vm.formData.nickname = '-'
    expect(vm.isFormValid).toBeFalsy()
  })

  it('невалидна с доставкой если город состоит только из тире', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    vm.formData.nickname = '@ivan'
    vm.isDelivery = true
    vm.formData.city = '-'
    vm.formData.recipient = 'Иван Иванов'
    vm.formData.street = 'Ленина'
    vm.formData.house = '1'
    expect(vm.isFormValid).toBeFalsy()
  })

  it('невалидна с доставкой если получатель — одно слово', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    vm.formData.nickname = '@ivan'
    vm.isDelivery = true
    vm.formData.city = 'Москва'
    vm.formData.recipient = 'Иванов'
    vm.formData.street = 'Ленина'
    vm.formData.house = '1'
    expect(vm.isFormValid).toBeFalsy()
  })

  it('невалидна с доставкой если получатель состоит только из тире', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    vm.formData.nickname = '@ivan'
    vm.isDelivery = true
    vm.formData.city = 'Москва'
    vm.formData.recipient = '-'
    vm.formData.street = 'Ленина'
    vm.formData.house = '1'
    expect(vm.isFormValid).toBeFalsy()
  })

  it('валидна с доставкой если получатель — три слова (ФИО)', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    vm.formData.nickname = '@ivan'
    vm.isDelivery = true
    vm.formData.city = 'Москва'
    vm.formData.recipient = 'Иван Иванович Иванов'
    vm.formData.street = 'Ленина'
    vm.formData.house = '1'
    expect(vm.isFormValid).toBeTruthy()
  })

  it('невалидна с доставкой если улица состоит только из тире', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    vm.formData.nickname = '@ivan'
    vm.isDelivery = true
    vm.formData.city = 'Москва'
    vm.formData.recipient = 'Иван Иванов'
    vm.formData.street = '-'
    vm.formData.house = '1'
    expect(vm.isFormValid).toBeFalsy()
  })

  it('невалидна с доставкой если дом и квартира состоят только из тире', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    vm.formData.nickname = '@ivan'
    vm.isDelivery = true
    vm.formData.city = 'Москва'
    vm.formData.recipient = 'Иван Иванов'
    vm.formData.street = 'Ленина'
    vm.formData.house = '-'
    vm.formData.apartment = '-'
    expect(vm.isFormValid).toBeFalsy()
  })

  it('валидна с доставкой если заполнена только квартира без дома', () => {
    const wrapper = mountForm()
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    vm.formData.nickname = '@ivan'
    vm.isDelivery = true
    vm.formData.city = 'Москва'
    vm.formData.recipient = 'Иван Иванов'
    vm.formData.street = 'Ленина'
    vm.formData.house = ''
    vm.formData.apartment = '5'
    expect(vm.isFormValid).toBeTruthy()
  })
})

describe('OrderForm — submitOrder', () => {
  let mockSendTelegram: ReturnType<typeof vi.fn>
  let mockSendEmail: ReturnType<typeof vi.fn>
  let mockToastAdd: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setActivePinia(createPinia())
    mockAddNewOrder.mockResolvedValue('order_123')

    mockSendTelegram = vi.fn()
    mockSendEmail = vi.fn()
    mockToastAdd = vi.fn()

    vi.stubGlobal('useLocales', () => ({ printLocale: (key: string) => key }))
    vi.stubGlobal('useShop', () => ({
      sendOrderInfoTelegram: mockSendTelegram,
      sendOrderInfoEmail: mockSendEmail,
      addOrderToUser: vi.fn(),
      createOrder: vi.fn(),
    }))
    vi.stubGlobal('useToast', () => ({ add: mockToastAdd }))
  })

  function mountWithValidForm() {
    const wrapper = mount(OrderForm, { global: { stubs: globalStubs } })
    const vm = getVm<OrderFormVmInstance>(wrapper)
    vm.formData.name = 'Иван'
    vm.formData.email = 'ivan@test.ru'
    vm.messengerType = ['Телеграм']
    vm.formData.nickname = '@ivan'
    return wrapper
  }

  // it('вызывает addNewOrder с данными заказа', async () => {
  //   const wrapper = mountWithValidForm()
  //   await getVm<OrderFormVmInstance>(wrapper).submitOrder()
  //   await flushPromises()

  //   expect(mockAddNewOrder).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       customer: expect.objectContaining({
  //         name: 'Иван',
  //         email: 'ivan@test.ru',
  //       }),
  //     }),
  //     'orders/',
  //   )
  // })

  // it('эмитит successOrder с orderId после успешной отправки', async () => {
  //   const wrapper = mountWithValidForm()
  //   await getVm<OrderFormVmInstance>(wrapper).submitOrder()
  //   await flushPromises()

  //   expect(wrapper.emitted('successOrder')).toBeTruthy()
  //   expect(wrapper.emitted('successOrder')?.[0]).toEqual(['order_123'])
  // })

  // it('очищает корзину после успешной отправки', async () => {
  //   const basketStore = useBasketStore()
  //   basketStore.addShopItemToBasket({
  //     item: { id: 1, title: 'Картина', price: 1000, stock: 5, size: '', material: '', tecnic: '', year: '', image: [], file: [] },
  //     amount: 1,
  //   })

  //   const wrapper = mountWithValidForm()
  //   await getVm<OrderFormVmInstance>(wrapper).submitOrder()
  //   await flushPromises()

  //   expect(basketStore.shoppingCart.length).toBe(0)
  // })

  // it('отправляет уведомления в Telegram и Email', async () => {
  //   const wrapper = mountWithValidForm()
  //   await getVm<OrderFormVmInstance>(wrapper).submitOrder()
  //   await flushPromises()

  //   expect(mockSendTelegram).toHaveBeenCalledTimes(1)
  //   expect(mockSendEmail).toHaveBeenCalledTimes(1)
  // })

  it('показывает toast и эмитит closeModal при ошибке', async () => {
    mockAddNewOrder.mockRejectedValueOnce(new Error('Network error'))

    const wrapper = mountWithValidForm()
    await getVm<OrderFormVmInstance>(wrapper).submitOrder()
    await flushPromises()

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Ошибка оформления заказа' }),
    )
    expect(wrapper.emitted('closeModal')).toBeTruthy()
  })

  // it('сбрасывает isSending в false после завершения (успех)', async () => {
  //   const wrapper = mountWithValidForm()
  //   await getVm<OrderFormVmInstance>(wrapper).submitOrder()
  //   await flushPromises()

  //   expect(getVm<OrderFormVmInstance>(wrapper).isSending).toBe(false)
  // })

  it('сбрасывает isSending в false после завершения (ошибка)', async () => {
    mockAddNewOrder.mockRejectedValueOnce(new Error('fail'))

    const wrapper = mountWithValidForm()
    await getVm<OrderFormVmInstance>(wrapper).submitOrder()
    await flushPromises()

    expect(getVm<OrderFormVmInstance>(wrapper).isSending).toBe(false)
  })
})
