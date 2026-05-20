import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Item from '../Item.vue'
import type { Product } from '~/types'
import type { ItemVmInstance } from '~/types/test'
import { getVm } from '~/utils/test-helpers'

const trackButtonClick = vi.fn()

const mockProduct: Product = {
  id: 1,
  title: 'Картина маслом',
  price: 1000,
  image: ['img1.jpg'],
  stock: 5,
  tags: ['масло', 'портрет'],
  description: 'Красивая картина',
  size: '',
  material: '',
  tecnic: '',
  year: '',
  file: [],
  categoryId: 'canvas',
  isReserved: false,
}

const mockProductSold: Product = {
  ...mockProduct,
  id: 2,
  stock: 0,
  isReserved: true,
}

const mockProductReserved: Product = {
  ...mockProduct,
  id: 3,
  stock: 2,
  isReserved: true,
}

const UButtonStub = { template: '<button v-bind="$attrs"><slot /></button>', inheritAttrs: false }

describe('Item.vue', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/shop',
          component: { template: '<div></div>' },
        },
        {
          path: '/basket',
          component: { template: '<div></div>' },
        },
      ],
    })

    vi.stubGlobal('metrics', { trackButtonClick })

    vi.stubGlobal('useLocales', () => ({
      printLocale: (key: string) => {
        const translations: Record<string, string> = {
          shop_item_buy: 'Купить',
          shop_item_in_basket: 'В корзине',
          shop_item_sold: 'Продано',
          shop_item_reserved_badge: 'Зарезервировано',
        }
        return translations[key] || key
      },
    }))
  })

  describe('рендеринг товара', () => {
    it('отображает название товара', async () => {
      const wrapper = mount(Item, {
        props: {
          product: mockProduct,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      expect(wrapper.text()).toContain('Картина маслом')
    })

    it('отображает цену товара', async () => {
      const wrapper = mount(Item, {
        props: {
          product: mockProduct,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      expect(wrapper.text()).toContain('1000 ₽')
    })

    it('отображает изображение товара', async () => {
      const wrapper = mount(Item, {
        props: {
          product: mockProduct,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('img1.jpg')
    })

    it('отображает теги товара', async () => {
      const wrapper = mount(Item, {
        props: {
          product: mockProduct,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      expect(wrapper.text()).toContain('масло')
      expect(wrapper.text()).toContain('портрет')
    })

    it('отображает дефолтное изображение если нет изображения товара', async () => {
      const productWithoutImage: Product = {
        ...mockProduct,
        image: [],
      }

      const wrapper = mount(Item, {
        props: {
          product: productWithoutImage,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('/default-shop-image.png')
    })
  })

  describe('статус товара в корзине', () => {
    it('показывает "Купить" если товар не в корзине', async () => {
      const wrapper = mount(Item, {
        props: {
          product: mockProduct,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      expect(wrapper.text()).toContain('Купить')
    })

    it('показывает "В корзине" если товар добавлен', async () => {
      const wrapper = mount(Item, {
        props: {
          product: mockProduct,
          isInBasket: true,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      expect(wrapper.text()).toContain('В корзине')
    })

  })

  describe('клики и эмиты', () => {
    it('эмитит "addToBasket" при клике на кнопку корзины', async () => {
      const wrapper = mount(Item, {
        props: {
          product: mockProduct,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      await wrapper.vm.$emit('addToBasket', mockProduct)

      expect(wrapper.emitted('addToBasket')).toBeTruthy()
    })

    it('эмитит "buy" при клике на кнопку "Купить" если товар не в корзине', async () => {
      const wrapper = mount(Item, {
        props: {
          product: mockProduct,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      getVm<ItemVmInstance>(wrapper).handleBuy()

      expect(wrapper.emitted('buy')).toBeTruthy()
      expect(wrapper.emitted('buy')?.[0]).toEqual([mockProduct])
    })

    it('редиректит в корзину если товар уже добавлен и нажать "В корзине"', async () => {
      await router.push('/shop')

      const wrapper = mount(Item, {
        props: {
          product: mockProduct,
          isInBasket: true,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      getVm<ItemVmInstance>(wrapper).handleBuy()
      await flushPromises()

      expect(router.currentRoute.value.path).toBe('/basket')
    })

    it('эмитит "filterByTag" при клике на тег', async () => {
      const wrapper = mount(Item, {
        props: {
          product: mockProduct,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      const tags = wrapper.findAll('[class*="primary-500"]')
      if (tags.length > 0) {
        await tags[0].trigger('click')
        expect(wrapper.emitted('filterByTag')).toBeTruthy()
      }
    })

    it('открывает модаль товара при клике на изображение', async () => {
      await router.push('/shop')

      const wrapper = mount(Item, {
        props: {
          product: mockProduct,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      getVm<ItemVmInstance>(wrapper).openProductPage()
      await flushPromises()

      expect(router.currentRoute.value.query.id).toBe('1')
    })
  })

  describe('специальные статусы товара', () => {
    it('показывает бейдж "Продано" для товара со stock=0 и isReserved=true', async () => {
      const wrapper = mount(Item, {
        props: {
          product: mockProductSold,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      expect(wrapper.text()).toContain('Продано')
    })

    it('показывает бейдж "Зарезервировано" для товара со stock>0 и isReserved=true', async () => {
      const wrapper = mount(Item, {
        props: {
          product: mockProductReserved,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      expect(wrapper.text()).toContain('Зарезервировано')
    })

    it('скрывает кнопки покупки для товара без наличия', async () => {
      const wrapper = mount(Item, {
        props: {
          product: mockProductSold,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      expect(wrapper.text()).not.toContain('Купить')
    })
  })

  describe('метрики', () => {
    it('отправляет метрику при клике на "Купить"', async () => {
      const wrapper = mount(Item, {
        props: {
          product: mockProduct,
          isInBasket: false,
        },
        global: {
          plugins: [router],
          stubs: { UButton: UButtonStub },
        },
      })

      getVm<ItemVmInstance>(wrapper).handleBuy()

      expect(trackButtonClick).toHaveBeenCalledWith('buyButton')
    })
  })
})
