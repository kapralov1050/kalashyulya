import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckout } from '../useCheckout'
import { useCheckoutStore } from '../store'
import { showToast } from '~/helpers/showToast'
import type { Product } from '~/types'

const mocks = vi.hoisted(() => ({
  addNewOrder: vi.fn().mockResolvedValue('order-id-123'),
  routerPush: vi.fn(),
  sendOrderInfoTelegram: vi.fn().mockResolvedValue({ success: true }),
  sendOrderInfoEmail: vi.fn().mockResolvedValue({ success: true }),
  updateDataByPath: vi.fn().mockResolvedValue(undefined),
}))

const consentState = { pdAgreed: true, hasConsent: true }
const mockShopDataRef = ref<{ products: Record<string, Product> }>({ products: {} })

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    addNewOrder: mocks.addNewOrder,
    shopData: mockShopDataRef,
    orders: ref([]),
    exhibitions: ref({}),
    subscribers: ref([]),
    addNewProduct: vi.fn(),
    updateOrderStatus: vi.fn(),
    setShopData: (path: string, value: unknown) => mocks.updateDataByPath(value, path),
    removeShopData: vi.fn(),
    updateLessonsTags: vi.fn(),
    watchOrders: vi.fn(),
    watchShopData: vi.fn(),
    currentUser: ref(null),
    isLoggedIn: ref(false),
    login: vi.fn(),
    logout: vi.fn(),
    onAuthStateChanged: vi.fn(),
  }),
}))

vi.mock('~/helpers/showToast', () => ({
  showToast: vi.fn(),
}))

vi.mock('~/composables/useShop', () => ({
  useShop: () => ({
    sendOrderInfoTelegram: mocks.sendOrderInfoTelegram,
    sendOrderInfoEmail: mocks.sendOrderInfoEmail,
    addOrderToUser: vi.fn(),
    createOrder: vi.fn(),
  }),
}))

vi.mock('~/helpers/firebase/manageDatabase', () => ({
  updateDataByPath: mocks.updateDataByPath,
}))

;(globalThis as Record<string, unknown>).useConsent = () => ({
  hasValidConsent: () => consentState.hasConsent,
  consents: { pdAgreed: consentState.pdAgreed },
  resetConsent: () => {},
})

;(globalThis as Record<string, unknown>).useShop = () => ({
  sendOrderInfoTelegram: mocks.sendOrderInfoTelegram,
  sendOrderInfoEmail: mocks.sendOrderInfoEmail,
  addOrderToUser: vi.fn(),
  createOrder: vi.fn(),
})

vi.stubGlobal('useRouter', () => ({ push: mocks.routerPush }))

function fillValidContacts(store: ReturnType<typeof useCheckoutStore>) {
  store.form.name = 'Иван Иванов'
  store.form.email = 'test@example.com'
  store.form.messengers = ['phone']
  store.form.phone = '+79991234567'
}

function fillValidCheckoutForm(store: ReturnType<typeof useCheckoutStore>) {
  fillValidContacts(store)
  store.form.deliveryType = 'pickup'
  store.form.payment = 'manual'
  store.form.framing = 'none'
}

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: 'Акварель "Море"',
    description: '',
    size: '30x40',
    material: 'paper',
    tecnic: 'watercolor',
    year: '2024',
    categoryId: 'paintings',
    image: [],
    file: [],
    price: 1000,
    stock: 5,
    tags: [],
    ...overrides,
  }
}

function setupBasketWithItem(basket: ReturnType<typeof useBasketStore>, product: Product) {
  basket.addShopItemToBasket({ amount: 1, item: product })
}

function setupShopDataWithProduct(product: Product) {
  mockShopDataRef.value = { products: { [String(product.id)]: product } }
}

function setProductionLocation() {
  try {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://kalashyulya.ru/checkout' },
      writable: true,
      configurable: true,
    })
  } catch {
    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => ({ href: 'https://kalashyulya.ru/checkout' }),
      set: () => {},
    })
  }
}

describe('useCheckout', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    consentState.hasConsent = true
    consentState.pdAgreed = true
    vi.clearAllMocks()
    mocks.routerPush.mockReset()
    mockShopDataRef.value = { products: {} }
    try {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost:3000/' },
        writable: true,
        configurable: true,
      })
    } catch {
      Object.defineProperty(window, 'location', {
        configurable: true,
        get: () => ({ href: 'http://localhost:3000/' }),
        set: () => {},
      })
    }
  })

  describe('visibleErrors', () => {
    it('returns no errors for untouched empty form on contacts step', () => {
      const { visibleErrors } = useCheckout()
      expect(visibleErrors.value).toEqual({})
    })

    it('shows error after touchField for invalid field', () => {
      const store = useCheckoutStore()
      const { visibleErrors, touchField } = useCheckout()

      store.form.name = 'X'
      touchField('name')

      expect(visibleErrors.value.name).toBeDefined()
    })

    it('returns all errors after submitAttempted becomes true', async () => {
      const store = useCheckoutStore()
      const { visibleErrors, submitAttempted, goTo } = useCheckout()

      goTo(0)
      store.form.name = ''
      store.form.email = ''
      store.form.messengers = []
      submitAttempted.value = true

      expect(visibleErrors.value.name).toBeDefined()
      expect(visibleErrors.value.email).toBeDefined()
      expect(visibleErrors.value.messengers).toBeDefined()
    })

    it('returns framing-specific error when submitAttempted and framing is empty', () => {
      const store = useCheckoutStore()
      const { visibleErrors, submitAttempted, goTo } = useCheckout()

      const framingIndex = 2
      goTo(framingIndex)
      store.form.framing = ''
      submitAttempted.value = true

      expect(visibleErrors.value.framing).toBe(
        'Пожалуйста, выберите вариант оформления',
      )
    })
  })

  describe('firstValidationError', () => {
    it('returns empty string when no errors', () => {
      const { firstValidationError } = useCheckout()
      expect(firstValidationError.value).toBe('')
    })

    it('returns first error message after touchField', () => {
      const store = useCheckoutStore()
      const { firstValidationError, touchField } = useCheckout()

      store.form.name = 'X'
      store.form.email = 'bad'
      touchField('name')
      touchField('email')

      expect(firstValidationError.value).toContain('минимум 2 символа')
    })
  })

  describe('submitAttempted reset on step change', () => {
    it('clears touchedFields and submitAttempted when currentStepId changes', async () => {
      const store = useCheckoutStore()
      const { visibleErrors, touchField, submitAttempted, goTo } = useCheckout()

      store.form.name = 'X'
      touchField('name')
      submitAttempted.value = true

      expect(visibleErrors.value.name).toBeDefined()

      goTo(1)
      await nextTick()
      goTo(0)
      await nextTick()

      expect(visibleErrors.value.name).toBeUndefined()
      expect(submitAttempted.value).toBe(false)
    })
  })

  describe('canProceed', () => {
    it('is false on contacts step with empty form', () => {
      const { canProceed, goTo } = useCheckout()
      goTo(0)
      expect(canProceed.value).toBe(false)
    })

    it('is true on contacts step with valid form', () => {
      const store = useCheckoutStore()
      const { canProceed, goTo } = useCheckout()

      fillValidContacts(store)
      goTo(0)

      expect(canProceed.value).toBe(true)
    })

    it('is false on payment step without consent', () => {
      const store = useCheckoutStore()
      const { canProceed, goTo } = useCheckout()

      fillValidCheckoutForm(store)
      consentState.hasConsent = false
      goTo(4)

      expect(canProceed.value).toBe(false)
    })

    it('is true on payment step with consent', () => {
      const store = useCheckoutStore()
      const { canProceed, goTo } = useCheckout()

      fillValidCheckoutForm(store)
      consentState.hasConsent = true
      goTo(4)

      expect(canProceed.value).toBe(true)
    })

    it('is false on framing step when framing is empty', () => {
      const store = useCheckoutStore()
      const { canProceed, goTo } = useCheckout()

      store.form.framing = ''
      goTo(2)

      expect(canProceed.value).toBe(false)
    })

    it('is true on framing step when framing is none', () => {
      const store = useCheckoutStore()
      const { canProceed, goTo } = useCheckout()

      store.form.framing = 'none'
      goTo(2)

      expect(canProceed.value).toBe(true)
    })

    it('is true on summary step regardless of form', () => {
      const { canProceed, goTo } = useCheckout()
      goTo(3)
      expect(canProceed.value).toBe(true)
    })
  })

  describe('advance', () => {
    it('moves to next step when canProceed is true', () => {
      const store = useCheckoutStore()
      const { advance, current, goTo } = useCheckout()

      fillValidContacts(store)
      goTo(0)
      const startIndex = current.value

      advance()

      expect(current.value).toBe(startIndex + 1)
    })

    it('sets submitAttempted when canProceed is false', () => {
      const { advance, submitAttempted, goTo } = useCheckout()

      goTo(0)
      expect(submitAttempted.value).toBe(false)

      advance()

      expect(submitAttempted.value).toBe(true)
    })

    it('triggers submit() on the last step', async () => {
      const store = useCheckoutStore()
      fillValidCheckoutForm(store)

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()

      await vi.waitFor(() => expect(mocks.addNewOrder).toHaveBeenCalled())
      await vi.waitFor(() =>
        expect(mocks.routerPush).toHaveBeenCalledWith('/shop'),
      )
    })
  })

  describe('submit', () => {
    it('blocks and shows toast when consent is missing', async () => {
      const store = useCheckoutStore()
      fillValidCheckoutForm(store)
      consentState.hasConsent = false

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()
      await nextTick()
      await nextTick()

      expect(mocks.addNewOrder).not.toHaveBeenCalled()
      expect(showToast).toHaveBeenCalledWith(
        'Подтвердите согласие',
        'Подтвердите согласие на обработку персональных данных',
        'heroicons:exclamation-circle',
      )
    })

    it('blocks and shows toast when form is invalid', async () => {
      const store = useCheckoutStore()
      store.form.name = 'X'
      store.form.email = ''
      store.form.messengers = []
      consentState.hasConsent = true

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()
      await nextTick()
      await nextTick()

      expect(mocks.addNewOrder).not.toHaveBeenCalled()
      expect(showToast).toHaveBeenCalledWith(
        'Проверьте данные',
        expect.any(String),
        'heroicons:exclamation-circle',
      )
    })
  })

  describe('submit - full flow', () => {
    it('creates order, redirects to /shop and clears basket on payment=manual', async () => {
      const store = useCheckoutStore()
      const basket = useBasketStore()
      fillValidCheckoutForm(store)
      store.form.payment = 'manual'

      const product = makeProduct()
      setupBasketWithItem(basket, product)
      setupShopDataWithProduct(product)

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()
      await vi.waitFor(() => expect(mocks.addNewOrder).toHaveBeenCalled())

      expect(mocks.addNewOrder).toHaveBeenCalledTimes(1)
      const [orderData, path] = mocks.addNewOrder.mock.calls[0]
      expect(orderData.customer.email).toBe('test@example.com')
      expect(orderData.paymentMethod).toBe('manual')
      expect(orderData.totalPrice).toBe(1000)
      expect(path).toBe('orders/')

      expect(mocks.routerPush).toHaveBeenCalledWith('/shop')
      expect(basket.shoppingCart).toEqual([])
      expect(showToast).toHaveBeenCalledWith(
        'Заказ оформлен!',
        'Мы свяжемся с вами для подтверждения.',
        'heroicons:check-circle',
      )
    })

    it('creates order and redirects to /shop/payment with query on payment=yookassa', async () => {
      const store = useCheckoutStore()
      const basket = useBasketStore()
      fillValidCheckoutForm(store)
      store.form.payment = 'yookassa'

      const product = makeProduct({ price: 2500 })
      setupBasketWithItem(basket, product)
      setupShopDataWithProduct(product)

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()
      await vi.waitFor(() => expect(mocks.addNewOrder).toHaveBeenCalled())

      expect(mocks.addNewOrder).toHaveBeenCalledTimes(1)
      expect(mocks.addNewOrder.mock.calls[0][0].paymentMethod).toBe('yookassa')
      expect(mocks.routerPush).toHaveBeenCalledWith({
        path: '/shop/payment',
        query: {
          orderId: 'order-id-123',
          amount: '2500',
          description: 'Оплата заказа #order-id-123',
        },
      })
    })

    it('blocks submit and shows toast when basket items are sold out', async () => {
      const store = useCheckoutStore()
      const basket = useBasketStore()
      fillValidCheckoutForm(store)

      const inBasket = makeProduct({ stock: 1 })
      const soldOutProduct = makeProduct({ id: 2, title: 'Проданный', stock: 0 })
      setupBasketWithItem(basket, soldOutProduct)
      setupShopDataWithProduct(inBasket)

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()
      await vi.waitFor(() => expect(showToast).toHaveBeenCalled())

      expect(mocks.addNewOrder).not.toHaveBeenCalled()
      expect(mocks.routerPush).not.toHaveBeenCalled()
      expect(showToast).toHaveBeenCalledWith(
        'Товары недоступны',
        'Проданный — уже нет в наличии',
        'heroicons:exclamation-circle',
      )
    })

    it('blocks submit when product is missing from shopData', async () => {
      const store = useCheckoutStore()
      const basket = useBasketStore()
      fillValidCheckoutForm(store)

      const orphanProduct = makeProduct({ id: 99, title: 'Призрак' })
      setupBasketWithItem(basket, orphanProduct)
      setupShopDataWithProduct(makeProduct({ id: 1 }))

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()
      await vi.waitFor(() => expect(showToast).toHaveBeenCalled())

      expect(mocks.addNewOrder).not.toHaveBeenCalled()
      expect(showToast).toHaveBeenCalledWith(
        'Товары недоступны',
        expect.stringContaining('Призрак'),
        'heroicons:exclamation-circle',
      )
    })

    it('blocks submit when product is reserved', async () => {
      const store = useCheckoutStore()
      const basket = useBasketStore()
      fillValidCheckoutForm(store)

      const reservedProduct = makeProduct({ id: 5, title: 'Зарезервированный', isReserved: true })
      setupBasketWithItem(basket, reservedProduct)
      setupShopDataWithProduct(reservedProduct)

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()
      await vi.waitFor(() => expect(showToast).toHaveBeenCalled())

      expect(mocks.addNewOrder).not.toHaveBeenCalled()
      expect(showToast).toHaveBeenCalledWith(
        'Товары недоступны',
        'Зарезервированный — уже нет в наличии',
        'heroicons:exclamation-circle',
      )
    })

    it('sends telegram and email notifications when not on test host', async () => {
      setProductionLocation()
      const store = useCheckoutStore()
      const basket = useBasketStore()
      fillValidCheckoutForm(store)

      const product = makeProduct()
      setupBasketWithItem(basket, product)
      setupShopDataWithProduct(product)

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()
      await vi.waitFor(() => expect(mocks.sendOrderInfoTelegram).toHaveBeenCalled())

      expect(mocks.sendOrderInfoTelegram).toHaveBeenCalledTimes(1)
      expect(mocks.sendOrderInfoEmail).toHaveBeenCalledTimes(1)
      expect(mocks.sendOrderInfoTelegram.mock.calls[0][0].customer.email).toBe('test@example.com')
      expect(mocks.updateDataByPath).not.toHaveBeenCalled()
    })

    it('writes notificationFailed to firebase when notifications fail', async () => {
      setProductionLocation()
      mocks.sendOrderInfoTelegram.mockResolvedValueOnce({ success: false })
      mocks.sendOrderInfoEmail.mockResolvedValueOnce({ success: false })

      const store = useCheckoutStore()
      const basket = useBasketStore()
      fillValidCheckoutForm(store)

      const product = makeProduct()
      setupBasketWithItem(basket, product)
      setupShopDataWithProduct(product)

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()
      await vi.waitFor(() => expect(mocks.updateDataByPath).toHaveBeenCalled())

      expect(mocks.addNewOrder).toHaveBeenCalledTimes(1)
      expect(mocks.updateDataByPath).toHaveBeenCalledWith(
        { notificationFailed: { telegram: true, email: true } },
        'orders/order_order-id-123',
      )
    })

    it('sets orderInfo on ordersStore before addNewOrder', async () => {
      const store = useCheckoutStore()
      const basket = useBasketStore()
      const orders = useOrdersStore()
      fillValidCheckoutForm(store)

      const product = makeProduct()
      setupBasketWithItem(basket, product)
      setupShopDataWithProduct(product)

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()
      await vi.waitFor(() => expect(mocks.addNewOrder).toHaveBeenCalled())

      expect(orders.orderInfo).not.toBeNull()
      expect(orders.orderInfo?.customer.email).toBe('test@example.com')
      expect(orders.orderInfo?.totalPrice).toBe(1000)
    })

    it('resets checkout store on success', async () => {
      const store = useCheckoutStore()
      const basket = useBasketStore()
      fillValidCheckoutForm(store)

      const product = makeProduct()
      setupBasketWithItem(basket, product)
      setupShopDataWithProduct(product)

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()
      await vi.waitFor(() => expect(mocks.addNewOrder).toHaveBeenCalled())

      expect(store.form.name).toBe('')
      expect(store.form.email).toBe('')
      expect(store.form.payment).toBe('')
      expect(store.form.framing).toBe('')
    })
  })
})
