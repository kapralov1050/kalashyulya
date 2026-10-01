import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useBasketStore } from '~/stores/basket'
import type { Product } from '~/types'
import type { BasketVmInstance } from '~/types/test'
import { getVm } from '~/utils/test-helpers'
import Basket from '../basket.vue'

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

const mockShopData = ref<{ products: Record<string, Product> } | null>(null)

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    shopData: mockShopData,
    isProductsLoaded: ref(true),
    isProductsFailed: ref(false),
    loadProducts: vi.fn(async () => {}),
  }),
}))

const mockToastAdd = vi.fn()
const mockUseToast = vi.fn(() => ({ add: mockToastAdd }))

describe('Basket.vue', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    setActivePinia(createPinia())
    mockShopData.value = null
    vi.stubGlobal('useSeo', vi.fn())

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
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      expect(wrapper.text()).toContain('Итого')
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
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      expect(basketStore.shoppingCart.length).toBe(1)

      await getVm<BasketVmInstance>(wrapper).deleteShopItemFromBasket(
        mockProduct1,
      )

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
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      const initialAmount = basketStore.shoppingCart[0]?.amount ?? 0
      await getVm<BasketVmInstance>(wrapper).decreaseAmount(mockProduct1)

      expect(basketStore.shoppingCart[0]?.amount).toBe(initialAmount - 1)
    })

    it('увеличивает количество товара при клике плюс', async () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })

      const wrapper = mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            AppSectionHeader: true,
            PaymentMethodSelector: true,
            UButton: false,
            UModal: true,
          },
        },
      })

      const initialAmount = basketStore.shoppingCart[0]?.amount ?? 0
      await getVm<BasketVmInstance>(wrapper).increaseAmount(mockProduct1)

      expect(basketStore.shoppingCart[0]?.amount).toBe(initialAmount + 1)
    })
  })

  describe('количество и наличие', () => {
    const mountBasket = () =>
      mount(Basket, {
        global: {
          plugins: [router],
          stubs: {
            UButton: {
              props: ['disabled'],
              template: '<button :disabled="disabled"><slot /></button>',
            },
            NuxtLink: { template: '<a><slot /></a>' },
          },
        },
      })

    it('не показывает выбор количества у работы в единственном экземпляре', () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({
        item: { ...mockProduct1, stock: 1 },
        amount: 1,
      })

      expect(mountBasket().find('[role="group"]').exists()).toBe(false)
    })

    it('показывает выбор количества у тиражного товара', () => {
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 2 })

      expect(mountBasket().find('[role="group"]').exists()).toBe(true)
    })

    it('помечает проданную работу и блокирует оформление', () => {
      mockShopData.value = {
        products: {
          product_1: { ...mockProduct1, stock: 0, isReserved: true },
          product_2: mockProduct2,
        },
      }
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })
      basketStore.addShopItemToBasket({ item: mockProduct2, amount: 1 })

      const wrapper = mountBasket()
      const checkout = wrapper
        .findAll('button')
        .find(button => button.text().includes('Оформить заказ'))

      expect(wrapper.text()).toContain('Уже продано')
      expect(checkout?.attributes('disabled')).toBeDefined()
    })

    it('считает итог только по доступным товарам', () => {
      mockShopData.value = {
        products: {
          product_1: { ...mockProduct1, stock: 0, isReserved: true },
          product_2: mockProduct2,
        },
      }
      const basketStore = useBasketStore()
      basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })
      basketStore.addShopItemToBasket({ item: mockProduct2, amount: 1 })

      const text = mountBasket().text().replace(/\s/g, ' ')
      expect(text).toContain('Товары (1)')
      expect(text).toContain('2 000 ₽')
    })
  })
})
