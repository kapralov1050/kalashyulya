import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Phase D migration: categoryId теперь с префиксом «category_<n>».
// Раньше код сравнивал со старыми Firebase id (числами) — после миграции
// ничего не матчилось → Gallery была пустой.
//
// Мокаем модуль ~/stores/shop (а не globalThis — vi.stubGlobal не работает
// для ES-module imports).
//
// Gallery.vue делает `shopStore.allProducts.filter(...)` (прямой доступ,
// как в реальном Pinia setup-store). Mock возвращает массив как обычное
// свойство, чтобы компонент мог вызвать .filter() напрямую. Заменяем
// перед каждым тестом через `mockProducts` reassign.

const stubs = {
  UCarousel: {
    template: '<div><slot v-for="(item, i) in items" :item="item" :key="i" /></div>',
    props: ['items'],
  },
  FlipCard: { template: '<div>{{ title }}</div>', props: ['title', 'description', 'image'] },
}

function createProducts() {
  return [
    { id: '1', title: 'Snow', price: 1000, categoryId: 'category_1', image: ['/x.jpg'], stock: 1, status: 'available', isReserved: false },
    { id: '2', title: 'Rain', price: 500, categoryId: 'category_2', image: ['/x.jpg'], stock: 1, status: 'available', isReserved: false },
    { id: '3', title: 'Cal 1', price: 300, categoryId: 'category_5', image: ['/x.jpg'], stock: 1, status: 'available', isReserved: false },
  ]
}

let mockProducts = createProducts()

vi.mock('~/stores/shop', () => ({
  useShopStore: () => ({
    // Mock plain-объект: allProducts — массив (а не ComputedRef).
    // Pinia в production unwrap'ает getter/ref → массив; в моке
    // возвращаем массив напрямую — тот же результат.
    get allProducts() { return mockProducts },
    loadProducts: vi.fn(),
  }),
}))

// useLocales тоже надо мокнуть — иначе useLocales() вернёт undefined
// и printLocale(...) упадёт.
vi.mock('~/composables/useLocales', () => ({
  useLocales: () => ({
    printLocale: (k: string) => k,
  }),
}))

async function mountGallery() {
  const Gallery = (await import('../Gallery.vue')).default
  const wrapper = mount(Gallery, {
    global: { stubs, plugins: [createPinia()] },
  })
  await nextTick()
  return wrapper
}

describe('Gallery (about page carousel)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockProducts = createProducts()
  })

  it('показывает товары из watercolor (category_1)', async () => {
    const wrapper = await mountGallery()
    // 1 товар из category_1 в нашем mock ("Snow")
    expect(wrapper.text()).toContain('Snow')
    expect(wrapper.text()).not.toContain('Rain')
    expect(wrapper.text()).not.toContain('Cal 1')
  })

  it('не фильтрует по короткому id (регрессия: раньше сравнивали с "1")', async () => {
    // '1' (без префикса) НЕ должен матчиться — это была причина бага
    mockProducts = [
      { id: 'x', title: 'OldCat1', price: 100, categoryId: '1', image: [], stock: 1, status: 'available', isReserved: false },
    ]
    const wrapper = await mountGallery()
    expect(wrapper.text()).not.toContain('OldCat1')
  })
})