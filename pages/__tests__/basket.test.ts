import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import Basket from '../basket.vue'
import { useBasketStore } from '~/stores/basket'
import type { Product } from '~/types'
import type { BasketVmInstance } from '~/types/test'
import { getVm } from '~/utils/test-helpers'

const base: Omit<Product, 'id' | 'title' | 'price' | 'stock' | 'categoryId'> = {
  description: '',
  size: '',
  material: '',
  tecnic: '',
  year: '',
  image: [],
  file: [],
  tags: [],
}

const mockProduct1: Product = {
  ...base,
  id: 1,
  title: 'Картина 1',
  price: 1000,
  image: ['img1.jpg'],
  stock: 5,
  tags: ['масло'],
  categoryId: 'canvas',
}

const mockProduct2: Product = {
  ...base,
  id: 2,
  title: 'Картина 2',
  price: 2000,
  image: ['img2.jpg'],
  stock: 3,
  tags: ['акварель'],
  categoryId: 'watercolor',
}

const mockToastAdd = vi.fn()
const mockUseToast = vi.fn(() => ({ add: mockToastAdd }))

describe('Basket.vue', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    setActivePinia(createPinia())

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/basket', component: { template: '<div></div>' } },
        { path: '/shop', component: { template: '<div></div>' } },
        { path: '/shop/payment', component: { template: '<div></div>' } },
      ],
    })

    vi.stubGlobal('metrics', {
      trackButtonClick: vi.fn(),
    })

    vi.stubGlobal('useLocales', () => ({
      printLocale: (key: string) => {
        const translations: Record<string, string> = {
          basket_title: 'Корзина',
          basket_subtitle: 'Ваши товары',
        }
        return translations[key] || key
      },
    }))

    vi.stubGlobal('useToast', mockUseToast)
  })

  describe('рендеринг корзины', () => {
    it('показывает "Корзина пуста" когда товаров нет', async () => {
      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      expect(wrapper.text()).toContain('Корзина пуста')
    })

    it('показывает товары в корзине', async () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 2 })

      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      expect(wrapper.text()).toContain('Картина 1')
      expect(wrapper.text()).toContain('2')
    })

    it('показывает итоговую сумму', async () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 2 })

      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      expect(wrapper.text()).toContain('Итого:')
    })

    it('показывает количество товаров', async () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })
      basketStore.addShopItemToBasket({ item: mockProduct2, amount: 2 })

      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      expect(wrapper.text()).toContain('3')
    })
  })

  describe('операции с товарами', () => {
    it('удаляет товар из корзины при клике "убрать"', async () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })

      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      expect(basketStore.shoppingCart.length).toBe(1)

      await getVm<BasketVmInstance>(wrapper).deleteShopItemFromBasket(mockProduct1)

      expect(basketStore.shoppingCart.length).toBe(0)
    })

    it('уменьшает количество товара при клике минус', async () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 3 })

      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      const initialAmount = basketStore.shoppingCart[0].amount
      await getVm<BasketVmInstance>(wrapper).decreaseAmount(mockProduct1)

      expect(basketStore.shoppingCart[0].amount).toBe(initialAmount - 1)
    })

    it('увеличивает количество товара при клике плюс', async () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })

      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      const initialAmount = basketStore.shoppingCart[0].amount
      await getVm<BasketVmInstance>(wrapper).increaseAmount(mockProduct1)

      expect(basketStore.shoppingCart[0].amount).toBe(initialAmount + 1)
    })
  })

  describe('модальное окно OrderForm', () => {
    it('открывает OrderModal и сохраняет состояние', async () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })

      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: {
              template: '<div v-if="open"><slot /></div>',
              props: ['open'],
            },
          },
        },
      })

      expect(getVm<BasketVmInstance>(wrapper).isOrderModalOpen).toBe(false)

      getVm<BasketVmInstance>(wrapper).isOrderModalOpen = true
      await wrapper.vm.$nextTick()

      expect(getVm<BasketVmInstance>(wrapper).isOrderModalOpen).toBe(true)
    })

    it('сохраняет сумму до очистки корзины', async () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 2 })

      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      const savedAmount = basketStore.totalPurchaseAmount

      getVm<BasketVmInstance>(wrapper).startOrder()
      await wrapper.vm.$nextTick()

      expect(getVm<BasketVmInstance>(wrapper).savedAmount).toBe(savedAmount)
    })
  })

  describe('выбор способа оплаты', () => {
    it('редиректит на /shop/payment с корректными параметрами для yookassa', async () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })

      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      getVm<BasketVmInstance>(wrapper).currentOrderId = 'order_123'
      getVm<BasketVmInstance>(wrapper).savedAmount = 1000

      await getVm<BasketVmInstance>(wrapper).handlePaymentMethod('yookassa')
      await flushPromises()

      expect(router.currentRoute.value.path).toBe('/shop/payment')
      expect(router.currentRoute.value.query.orderId).toBe('order_123')
      expect(router.currentRoute.value.query.amount).toBe('1000')
    })

    it('показывает toast и редиректит в магазин для manual оплаты', async () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })

      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      await getVm<BasketVmInstance>(wrapper).handlePaymentMethod('manual')
      await flushPromises()

      expect(router.currentRoute.value.path).toBe('/shop')
      expect(mockToastAdd).toHaveBeenCalled()
    })
  })

  describe('состояние шагов модала', () => {
    it('показывает OrderForm на первом шаге', async () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })

      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      getVm<BasketVmInstance>(wrapper).isOrderModalOpen = true
      getVm<BasketVmInstance>(wrapper).orderCreated = false
      await wrapper.vm.$nextTick()

      expect(getVm<BasketVmInstance>(wrapper).orderCreated).toBe(false)
    })

    it('переходит на второй шаг (PaymentMethodSelector) после успешного заказа', async () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })

      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      getVm<BasketVmInstance>(wrapper).handleOrderCreated('order_123')
      await wrapper.vm.$nextTick()

      expect(getVm<BasketVmInstance>(wrapper).orderCreated).toBe(true)
      expect(getVm<BasketVmInstance>(wrapper).currentOrderId).toBe('order_123')
    })

    it('сбрасывает состояние при закрытии модала', async () => {
      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      getVm<BasketVmInstance>(wrapper).orderCreated = true
      getVm<BasketVmInstance>(wrapper).currentOrderId = 'order_123'
      getVm<BasketVmInstance>(wrapper).isOrderModalOpen = true
      await wrapper.vm.$nextTick()

      getVm<BasketVmInstance>(wrapper).isOrderModalOpen = false
      await wrapper.vm.$nextTick()

      expect(getVm<BasketVmInstance>(wrapper).orderCreated).toBe(false)
      expect(getVm<BasketVmInstance>(wrapper).currentOrderId).toBe('')
    })
  })

  describe('текст кнопки', () => {
    it('возвращает текст кнопки оформления', async () => {
      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      expect(getVm<BasketVmInstance>(wrapper).purchaseButtonText).toBeDefined()
    })
  })

  describe('modal title', () => {
    it('меняет заголовок модала на шаге 1', async () => {
      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      getVm<BasketVmInstance>(wrapper).orderCreated = false

      expect(getVm<BasketVmInstance>(wrapper).modalTitle).toBe('Оформление заказа')
    })

    it('меняет заголовок модала на шаге 2', async () => {
      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            OrderForm: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      getVm<BasketVmInstance>(wrapper).orderCreated = true

      expect(getVm<BasketVmInstance>(wrapper).modalTitle).toBe('Способ оплаты')
    })
  })
})
