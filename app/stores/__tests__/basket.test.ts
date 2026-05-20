import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBasketStore } from '../basket'
import type { Product } from '~/types'

const base: Omit<Product, 'id' | 'title' | 'price' | 'stock' | 'categoryId' | 'isReserved'> = {
  description: '',
  size: '',
  material: '',
  tecnic: '',
  year: '',
  image: [],
  file: [],
  tags: [],
}

const product1: Product = {
  ...base,
  id: 1,
  title: 'Картина маслом',
  price: 1000,
  image: ['img1.jpg'],
  stock: 5,
  tags: ['масло'],
  categoryId: 'canvas',
  isReserved: false,
}

const product2: Product = {
  ...base,
  id: 2,
  title: 'Акварель',
  price: 500,
  image: ['img2.jpg'],
  stock: 3,
  tags: ['акварель'],
  categoryId: 'watercolor',
  isReserved: false,
}

describe('useBasketStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('totalPurchaseAmount', () => {
    it('возвращает 0 для пустой корзины', () => {
      const store = useBasketStore()
      expect(store.totalPurchaseAmount).toBe(0)
    })

    it('умножает цену на количество для одной позиции', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 3 })
      expect(store.totalPurchaseAmount).toBe(3000)
    })

    it('суммирует все позиции с учётом количества', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 2 })
      store.addShopItemToBasket({ item: product2, amount: 4 })
      // 1000*2 + 500*4 = 2000 + 2000 = 4000
      expect(store.totalPurchaseAmount).toBe(4000)
    })

    it('не считает просто цену без умножения на количество (регрессия)', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 2 })
      expect(store.totalPurchaseAmount).not.toBe(1000)
      expect(store.totalPurchaseAmount).toBe(2000)
    })

    it('пересчитывается после изменения количества', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      store.changeShopItemQty(2, product1)
      expect(store.totalPurchaseAmount).toBe(3000)
    })

    it('пересчитывается после удаления товара', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 2 })
      store.addShopItemToBasket({ item: product2, amount: 1 })
      store.deleteShopItemFromBasket(product1)
      expect(store.totalPurchaseAmount).toBe(500)
    })

    it('возвращает 0 после очистки корзины', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 3 })
      store.clearBasket()
      expect(store.totalPurchaseAmount).toBe(0)
    })
  })

  describe('totalPurchaceQty', () => {
    it('возвращает 0 для пустой корзины', () => {
      const store = useBasketStore()
      expect(store.totalPurchaceQty).toBe(0)
    })

    it('возвращает сумму amount, а не количество уникальных позиций (регрессия)', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      store.addShopItemToBasket({ item: product2, amount: 2 })
      // раньше возвращало 2 (.length), правильно — 3
      expect(store.totalPurchaceQty).toBe(3)
      expect(store.totalPurchaceQty).not.toBe(2)
    })

    it('возвращает amount одной позиции', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 5 })
      expect(store.totalPurchaceQty).toBe(5)
    })

    it('пересчитывается после изменения количества', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 2 })
      store.changeShopItemQty(1, product1)
      expect(store.totalPurchaceQty).toBe(3)
    })

    it('уменьшается после удаления товара', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 3 })
      store.addShopItemToBasket({ item: product2, amount: 2 })
      store.deleteShopItemFromBasket(product1)
      expect(store.totalPurchaceQty).toBe(2)
    })
  })

  describe('addShopItemToBasket', () => {
    it('добавляет новый товар в корзину', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      expect(store.shoppingCart).toHaveLength(1)
      expect(store.shoppingCart[0].item.id).toBe(1)
    })

    it('не добавляет дубликат если товар уже в корзине', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      store.addShopItemToBasket({ item: product1, amount: 2 })
      expect(store.shoppingCart).toHaveLength(1)
      expect(store.shoppingCart[0].amount).toBe(1)
    })

    it('сохраняет корзину в localStorage', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 2 })
      const saved = JSON.parse(localStorage.getItem('basket') ?? '[]')
      expect(saved).toHaveLength(1)
      expect(saved[0].item.id).toBe(1)
      expect(saved[0].amount).toBe(2)
    })

    it('можно добавить несколько разных товаров', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      store.addShopItemToBasket({ item: product2, amount: 1 })
      expect(store.shoppingCart).toHaveLength(2)
    })
  })

  describe('deleteShopItemFromBasket', () => {
    it('удаляет товар из корзины по id', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      store.deleteShopItemFromBasket(product1)
      expect(store.shoppingCart).toHaveLength(0)
    })

    it('не трогает другие товары при удалении', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      store.addShopItemToBasket({ item: product2, amount: 2 })
      store.deleteShopItemFromBasket(product1)
      expect(store.shoppingCart).toHaveLength(1)
      expect(store.shoppingCart[0].item.id).toBe(2)
    })

    it('обновляет localStorage после удаления', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      store.addShopItemToBasket({ item: product2, amount: 1 })
      store.deleteShopItemFromBasket(product1)
      const saved = JSON.parse(localStorage.getItem('basket') ?? '[]')
      expect(saved).toHaveLength(1)
      expect(saved[0].item.id).toBe(2)
    })
  })

  describe('changeShopItemQty', () => {
    it('увеличивает количество товара', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      store.changeShopItemQty(2, product1)
      expect(store.shoppingCart[0].amount).toBe(3)
    })

    it('уменьшает количество товара', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 3 })
      store.changeShopItemQty(-1, product1)
      expect(store.shoppingCart[0].amount).toBe(2)
    })

    it('удаляет товар если количество становится 0', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      store.changeShopItemQty(-1, product1)
      expect(store.shoppingCart).toHaveLength(0)
    })

    it('удаляет товар если количество уходит в минус', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 2 })
      store.changeShopItemQty(-5, product1)
      expect(store.shoppingCart).toHaveLength(0)
    })

    it('не превышает лимит stock', () => {
      const store = useBasketStore()
      // product1.stock = 5
      store.addShopItemToBasket({ item: product1, amount: 4 })
      store.changeShopItemQty(2, product1)
      // 4+2=6 > stock(5), количество не должно измениться
      expect(store.shoppingCart[0].amount).toBe(4)
    })

    it('допускает количество равное stock', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 4 })
      store.changeShopItemQty(1, product1)
      // 4+1=5 === stock(5), должно применить
      expect(store.shoppingCart[0].amount).toBe(5)
    })

    it('сохраняет изменения в localStorage', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      store.changeShopItemQty(1, product1)
      const saved = JSON.parse(localStorage.getItem('basket') ?? '[]')
      expect(saved[0].amount).toBe(2)
    })
  })

  describe('clearBasket', () => {
    it('очищает корзину', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 2 })
      store.addShopItemToBasket({ item: product2, amount: 1 })
      store.clearBasket()
      expect(store.shoppingCart).toHaveLength(0)
    })

    it('удаляет корзину из localStorage', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      store.clearBasket()
      expect(localStorage.getItem('basket')).toBeNull()
    })
  })

  describe('loadPurchase', () => {
    it('загружает корзину из localStorage если корзина пуста', () => {
      localStorage.setItem(
        'basket',
        JSON.stringify([{ item: product1, amount: 3 }]),
      )
      const store = useBasketStore()
      store.loadPurchase()
      expect(store.shoppingCart).toHaveLength(1)
      expect(store.shoppingCart[0].amount).toBe(3)
    })

    it('не перезаписывает корзину если она уже заполнена', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      localStorage.setItem(
        'basket',
        JSON.stringify([{ item: product2, amount: 5 }]),
      )
      store.loadPurchase()
      expect(store.shoppingCart).toHaveLength(1)
      expect(store.shoppingCart[0].item.id).toBe(1)
    })

    it('не падает если в localStorage нет basket', () => {
      const store = useBasketStore()
      expect(() => store.loadPurchase()).not.toThrow()
      expect(store.shoppingCart).toHaveLength(0)
    })
  })

  describe('shortPurchaseInfo', () => {
    it('возвращает пустой массив для пустой корзины', () => {
      const store = useBasketStore()
      expect(store.shortPurchaseInfo).toEqual([])
    })

    it('маппит позиции в { amount, title, price }', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 2 })
      expect(store.shortPurchaseInfo).toEqual([
        { amount: 2, title: 'Картина маслом', price: 1000 },
      ])
    })

    it('возвращает данные для всех позиций', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      store.addShopItemToBasket({ item: product2, amount: 3 })
      expect(store.shortPurchaseInfo).toHaveLength(2)
      expect(store.shortPurchaseInfo[1]).toEqual({
        amount: 3,
        title: 'Акварель',
        price: 500,
      })
    })

    it('не содержит лишних полей', () => {
      const store = useBasketStore()
      store.addShopItemToBasket({ item: product1, amount: 1 })
      const info = store.shortPurchaseInfo[0]
      expect(Object.keys(info)).toEqual(['amount', 'title', 'price'])
    })
  })
})
