import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductInBasket } from '../useProductInBasket'
import { useBasketStore } from '~/stores/basket'
import type { Product } from '~/types'

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

describe('useProductInBasket', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('возвращает false если товара нет в корзине', () => {
    const { isInBasket } = useProductInBasket(1)

    expect(isInBasket.value).toBe(false)
  })

  it('возвращает true если товар добавлен в корзину', () => {
    const basketStore = useBasketStore()
    basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })

    const { isInBasket } = useProductInBasket(1)

    expect(isInBasket.value).toBe(true)
  })

  it('реактивно обновляется когда товар добавляется в корзину', () => {
    const basketStore = useBasketStore()
    const { isInBasket } = useProductInBasket(1)

    expect(isInBasket.value).toBe(false)

    basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })

    expect(isInBasket.value).toBe(true)
  })

  it('реактивно обновляется когда товар удаляется из корзины', () => {
    const basketStore = useBasketStore()
    basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })

    const { isInBasket } = useProductInBasket(1)
    expect(isInBasket.value).toBe(true)

    basketStore.deleteShopItemFromBasket(mockProduct1)

    expect(isInBasket.value).toBe(false)
  })

  it('работает с productId переданным как строка', () => {
    const basketStore = useBasketStore()
    basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })

    const { isInBasket } = useProductInBasket('1')

    expect(isInBasket.value).toBe(true)
  })

  it('работает с productId переданным как число', () => {
    const basketStore = useBasketStore()
    basketStore.addShopItemToBasket({ item: mockProduct2, amount: 1 })

    const { isInBasket } = useProductInBasket(2)

    expect(isInBasket.value).toBe(true)
  })

  it('возвращает false если в корзине другой товар', () => {
    const basketStore = useBasketStore()
    basketStore.addShopItemToBasket({ item: mockProduct1, amount: 1 })

    const { isInBasket } = useProductInBasket(2)

    expect(isInBasket.value).toBe(false)
  })

  it('работает корректно если корзина пуста', () => {
    const basketStore = useBasketStore()
    basketStore.shoppingCart = []

    const { isInBasket } = useProductInBasket(1)

    expect(isInBasket.value).toBe(false)
  })

  it('проверяет наличие товара по ID, игнорируя количество', () => {
    const basketStore = useBasketStore()
    basketStore.addShopItemToBasket({ item: mockProduct1, amount: 5 })

    const { isInBasket } = useProductInBasket(1)

    expect(isInBasket.value).toBe(true)

    basketStore.changeShopItemQty(-4, mockProduct1)

    expect(isInBasket.value).toBe(true)
  })
})
