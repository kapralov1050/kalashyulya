import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import Item from '../Item.vue'
import type { Product } from '~/types'

const trackButtonClick = vi.fn()

const mockProduct: Product = {
  id: 1,
  title: 'Влажный воздух',
  price: 20000,
  image: ['img1.jpg'],
  stock: 1,
  tags: ['пейзаж', 'зима'],
  description: 'Первый зимний пленэр',
  size: '27,5*40',
  material: 'Бумага, акварель',
  tecnic: 'Акварель',
  year: '2025',
  file: [],
  categoryId: 'category_1',
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
  stock: 1,
  isReserved: true,
}

const UButtonStub = {
  props: ['to'],
  template:
    '<a v-if="to" :href="to" v-bind="$attrs"><slot /></a><button v-else v-bind="$attrs"><slot /></button>',
  inheritAttrs: false,
}

const NuxtLinkStub = {
  props: ['to'],
  template: '<a href="#" v-bind="$attrs"><slot /></a>',
  inheritAttrs: false,
}

describe('Item.vue', () => {
  let router: ReturnType<typeof createRouter>

  const mountItem = (product: Product, isInBasket = false) => {
    if (isInBasket) {
      useBasketStore().addShopItemToBasket({ amount: 1, item: product })
    }
    return mount(Item, {
      props: { product },
      global: {
        plugins: [router],
        stubs: { UButton: UButtonStub, NuxtLink: NuxtLinkStub },
      },
    })
  }

  beforeEach(async () => {
    trackButtonClick.mockClear()
    setActivePinia(createPinia())
    localStorage.clear()

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/shop', component: { template: '<div></div>' } },
        { path: '/basket', component: { template: '<div></div>' } },
      ],
    })
    await router.push('/shop')

    vi.stubGlobal('metrics', { trackButtonClick })

    vi.stubGlobal('useLocales', () => ({
      printLocale: (key: string) => {
        const translations: Record<string, string> = {
          shop_item_add_to_basket: 'Добавить в корзину',
          shop_item_sold: 'Продано',
          shop_item_reserved_badge: 'Забронировано',
        }
        return translations[key] || key
      },
    }))
  })

  describe('подпись к работе', () => {
    it('показывает название', () => {
      expect(mountItem(mockProduct).find('h2').text()).toBe('Влажный воздух')
    })

    it('показывает материал, размер и год одной строкой', () => {
      expect(mountItem(mockProduct).text()).toContain(
        'Бумага, акварель · 27,5 × 40 см · 2025',
      )
    })

    it('показывает цену с разделителем разрядов', () => {
      const text = mountItem(mockProduct).text().replace(/\s/g, ' ')
      expect(text).toContain('20 000 ₽')
    })

    it('не показывает теги в каталоге', () => {
      const text = mountItem(mockProduct).text()
      expect(text).not.toContain('пейзаж')
      expect(text).not.toContain('зима')
    })
  })

  describe('изображение', () => {
    it('берёт первое изображение товара', () => {
      expect(mountItem(mockProduct).find('img').attributes('src')).toBe(
        'img1.jpg',
      )
    })

    it('подставляет заглушку, если изображений нет', () => {
      const wrapper = mountItem({ ...mockProduct, image: [] })
      expect(wrapper.find('img').attributes('src')).toBe(
        '/default-shop-image.png',
      )
    })

    it('резервирует пропорции работы из размера «высота*ширина»', () => {
      const style = mountItem(mockProduct).find('img').attributes('style')
      expect(style).toContain('aspect-ratio: auto 40 / 27.5')
    })
  })

  describe('кнопка покупки', () => {
    it('показывает «Добавить в корзину», если товара нет в корзине', () => {
      const button = mountItem(mockProduct).find('button')
      expect(button.text()).toContain('Добавить в корзину')
    })

    it('кладёт товар в корзину и отправляет метрику при нажатии', async () => {
      const wrapper = mountItem(mockProduct)
      await wrapper.find('button').trigger('click')

      const cart = useBasketStore().shoppingCart
      expect(cart).toHaveLength(1)
      expect(cart[0]?.item.id).toBe(mockProduct.id)
      expect(cart[0]?.item).not.toHaveProperty('tags')
      expect(trackButtonClick).toHaveBeenCalledWith('addToBasket')
    })

    it('сразу после добавления показывает «Оформить заказ»', async () => {
      const wrapper = mountItem(mockProduct)
      await wrapper.find('button').trigger('click')

      expect(wrapper.find('a[href="/basket"]').text()).toContain(
        'Оформить заказ',
      )
    })

    it('после добавления становится ссылкой «Оформить заказ» на корзину', () => {
      const wrapper = mountItem(mockProduct, true)
      const link = wrapper.find('a[href="/basket"]')

      expect(link.exists()).toBe(true)
      expect(link.text()).toContain('Оформить заказ')
      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('называет товар в кнопке для скринридеров', () => {
      const button = mountItem(mockProduct).find('button')
      expect(button.find('.sr-only').text()).toBe('«Влажный воздух»')
    })
  })

  describe('недоступные товары', () => {
    it('показывает «Продано» без кнопки покупки', () => {
      const wrapper = mountItem(mockProductSold)

      expect(wrapper.text()).toContain('Продано')
      expect(wrapper.find('button').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('₽')
    })

    it('показывает «Забронировано» без кнопки покупки', () => {
      const wrapper = mountItem(mockProductReserved)

      expect(wrapper.text()).toContain('Забронировано')
      expect(wrapper.find('button').exists()).toBe(false)
    })
  })

  it('отправляет метрику при открытии карточки товара', async () => {
    const wrapper = mountItem(mockProduct)
    await wrapper.find('a').trigger('click')

    expect(trackButtonClick).toHaveBeenCalledWith('productExtendedButton')
  })
})
