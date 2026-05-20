import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useShopStore } from '../shop'
import type { Product } from '~/types'

const mockShopData = ref<{ products: Record<string, Product> } | null>(null)

vi.mock('~/composables/firebase/useFirebase', () => ({
  useFirebase: () => ({
    shopData: mockShopData,
    isLoading: ref(false),
  }),
}))

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

const mockProducts: Record<string, Product> = {
  product_1: {
    ...base,
    id: 1,
    title: 'Картина маслом',
    price: 1000,
    image: ['img1.jpg'],
    stock: 5,
    tags: ['масло', 'портрет'],
    categoryId: 'canvas',
    isReserved: false,
  },
  product_2: {
    ...base,
    id: 2,
    title: 'Акварель пейзаж',
    price: 500,
    image: ['img2.jpg'],
    stock: 3,
    tags: ['акварель', 'пейзаж'],
    categoryId: 'watercolor',
    isReserved: false,
  },
  product_3: {
    ...base,
    id: 3,
    title: 'Рисунок карандашом',
    price: 200,
    image: ['img3.jpg'],
    stock: 10,
    tags: ['карандаш', 'портрет'],
    categoryId: 'pencil',
    isReserved: false,
  },
  product_4: {
    ...base,
    id: 4,
    title: 'Картина без наличия',
    price: 800,
    image: ['img4.jpg'],
    stock: 0,
    tags: ['масло'],
    categoryId: 'canvas',
    isReserved: false,
  },
  product_5: {
    ...base,
    id: 5,
    title: 'Зарезервированная картина',
    price: 1200,
    image: ['img5.jpg'],
    stock: 0,
    tags: ['масло'],
    categoryId: 'canvas',
    isReserved: true,
  },
}

describe('useShopStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockShopData.value = { products: mockProducts }
  })

  describe('sortProducts', () => {
    it('сортирует товары по названию (A-Z)', () => {
      const store = useShopStore()

      store.setSortBy('title-asc')
      const sorted = store.paginatedProducts

      expect(sorted[0].title).toBe('Акварель пейзаж')
      expect(sorted[sorted.length - 1].title).toBe('Рисунок карандашом')
    })

    it('сортирует товары по названию (Z-A)', () => {
      const store = useShopStore()

      store.setSortBy('title-desc')
      const sorted = store.paginatedProducts

      expect(sorted[0].title).toBe('Рисунок карандашом')
    })

    it('сортирует товары по цене (дешевле→дороже)', () => {
      const store = useShopStore()

      store.setSortBy('price-asc')
      const sorted = store.paginatedProducts

      expect(sorted[0].price).toBe(200)
      expect(sorted[1].price).toBe(500)
      expect(sorted[2].price).toBe(1000)
    })

    it('сортирует товары по цене (дороже→дешевле)', () => {
      const store = useShopStore()

      store.setSortBy('price-desc')
      const sorted = store.paginatedProducts

      expect(sorted[0].price).toBe(1200)
      expect(sorted[sorted.length - 1].price).toBe(200)
    })

    it('сбрасывает страницу на 1 при изменении сортировки', () => {
      const store = useShopStore()
      store.currentPage = 3

      store.setSortBy('price-asc')

      expect(store.currentPage).toBe(1)
    })
  })

  describe('filterByCategory', () => {
    it('фильтрует товары по категории', () => {
      const store = useShopStore()

      store.categoryFilter = 'canvas'

      const filtered = store.allProducts
      expect(filtered.every(p => p.categoryId === 'canvas')).toBe(true)
    })

    it('сбрасывает страницу при изменении категории', async () => {
      const store = useShopStore()
      store.currentPage = 2

      store.categoryFilter = 'watercolor'
      await Promise.resolve() // Ждём watch

      expect(store.currentPage).toBe(1)
    })

    it('очищает searchedProducts при изменении категории', async () => {
      const store = useShopStore()
      store.searchedProducts = [mockProducts.product_1]

      store.categoryFilter = 'watercolor'
      await Promise.resolve()

      expect(store.searchedProducts).toBe(null)
    })
  })

  describe('filterByTags', () => {
    it('добавляет тег в selectedTags', () => {
      const store = useShopStore()

      store.addTag('масло')

      expect(store.selectedTags.includes('масло')).toBe(true)
    })

    it('не добавляет дубликаты тегов', () => {
      const store = useShopStore()

      store.addTag('масло')
      store.addTag('масло')

      expect(store.selectedTags.filter(t => t === 'масло').length).toBe(1)
    })

    it('удаляет тег из selectedTags', () => {
      const store = useShopStore()

      store.addTag('масло')
      store.removeTag('масло')

      expect(store.selectedTags.includes('масло')).toBe(false)
    })

    it('фильтрует товары по одному тегу', () => {
      const store = useShopStore()

      store.filterProductsByTag('портрет')

      const filtered = store.allProducts
      expect(filtered.every(p => p.tags?.includes('портрет'))).toBe(true)
      expect(filtered.length).toBe(2)
    })

    it('фильтрует товары по нескольким тегам (AND)', () => {
      const store = useShopStore()

      store.addTag('масло')
      store.addTag('портрет')
      store.filterProductsByTags()

      const filtered = store.searchedProducts ?? []
      expect(filtered.length).toBe(1)
      expect(filtered[0].id).toBe(1)
    })

    it('очищает все теги', () => {
      const store = useShopStore()

      store.addTag('масло')
      store.addTag('портрет')
      store.clearTags()

      expect(store.selectedTags.length).toBe(0)
    })
  })

  describe('filterByStock', () => {
    it('скрывает товары без наличия (кроме зарезервированных)', () => {
      const store = useShopStore()

      const filtered = store.allProducts

      expect(filtered.some(p => p.id === 4)).toBe(false)
      expect(filtered.some(p => p.id === 5)).toBe(true)
    })
  })

  describe('filterByFraming', () => {
    it('фильтрует товары только БЕЗ оформления', () => {
      const store = useShopStore()
      mockShopData.value = {
        products: {
          ...mockProducts,
          product_6: {
            ...mockProducts.product_1,
            id: 6,
            framing: ['frame'],
          },
        },
      }

      store.setFramingFilter('none')

      const filtered = store.allProducts
      expect(filtered.every(p => !p.framing || p.framing.length === 0)).toBe(true)
    })

    it('фильтрует товары ТОЛЬКО С оформлением', () => {
      const store = useShopStore()
      mockShopData.value = {
        products: {
          ...mockProducts,
          product_6: {
            ...mockProducts.product_1,
            id: 6,
            framing: ['frame'],
          },
        },
      }

      store.setFramingFilter('hasFraming')

      const filtered = store.allProducts
      expect(filtered.every(p => p.framing && p.framing.length > 0)).toBe(true)
    })

    it('сбрасывает страницу при изменении framing фильтра', () => {
      const store = useShopStore()
      store.currentPage = 2

      store.setFramingFilter('none')

      expect(store.currentPage).toBe(1)
    })
  })

  describe('pagination', () => {
    it('вычисляет totalPages правильно', () => {
      const store = useShopStore()
      store.itemsPerPage = 2

      expect(store.totalPages).toBeGreaterThan(0)
    })

    it('возвращает товары для текущей страницы', () => {
      const store = useShopStore()
      store.itemsPerPage = 2
      store.currentPage = 1

      expect(store.paginatedProducts.length).toBeLessThanOrEqual(2)
    })

    it('правильно рассчитывает товары для последней страницы', () => {
      const store = useShopStore()
      store.itemsPerPage = 2

      const lastPage = Math.ceil(store.totalItems / store.itemsPerPage)
      store.currentPage = lastPage

      expect(store.paginatedProducts.length).toBeGreaterThan(0)
      expect(store.paginatedProducts.length).toBeLessThanOrEqual(2)
    })

    it('setPage меняет currentPage', () => {
      const store = useShopStore()

      store.setPage(2)

      expect(store.currentPage).toBe(2)
    })

    it('setItemsPerPage меняет itemsPerPage', () => {
      const store = useShopStore()

      store.setItemsPerPage(24)

      expect(store.itemsPerPage).toBe(24)
    })
  })

  describe('search', () => {
    it('находит товары по названию (case-insensitive)', () => {
      const store = useShopStore()

      const results = store.findProduct('картина')

      // product_4 (stock=0, isReserved=false) фильтруется allProducts, остаётся 2
      expect(results.length).toBe(2)
      expect(results.every(p => p.title.toLowerCase().includes('картина'))).toBe(true)
    })

    it('возвращает пустой массив если ничего не найдено', () => {
      const store = useShopStore()

      const results = store.findProduct('xyz_не_существует')

      expect(results.length).toBe(0)
    })

    it('находит товары по частичному совпадению', () => {
      const store = useShopStore()

      const results = store.findProduct('пей')

      expect(results.length).toBe(1)
      expect(results[0].id).toBe(2)
    })
  })

  describe('computedTotalItems', () => {
    it('возвращает количество searchedProducts если они есть', () => {
      const store = useShopStore()
      store.searchedProducts = [mockProducts.product_1]

      expect(store.totalItems).toBe(1)
    })

    it('возвращает количество allProducts если searchedProducts пусты', () => {
      const store = useShopStore()
      store.searchedProducts = null

      expect(store.totalItems).toBeGreaterThan(0)
    })
  })

  describe('getProductFileName', () => {
    it('возвращает file товара если существует', () => {
      const store = useShopStore()
      mockShopData.value = {
        products: {
          product_1: { ...mockProducts.product_1, file: ['painting.pdf'] },
        },
      }

      const fileName = store.getProductFileName(1)

      expect(fileName).toEqual(['painting.pdf'])
    })

    it('возвращает null если товар не найден', () => {
      const store = useShopStore()

      const fileName = store.getProductFileName(9999)

      expect(fileName).toBeNull()
    })
  })
})
