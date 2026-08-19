import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useShopStore } from '~/stores/shop'

// Phase D migration: categoryId теперь с префиксом «category_<n>».
// Раньше код сравнивал со старыми Firebase id (числами) — после миграции
// ничего не матчилось → Gallery была пустой.

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

function mockShopStore() {
  const products = ref(createProducts())
  const store = {
    allProducts: products,
    loadProducts: vi.fn(),
  }
  vi.stubGlobal('useShopStore', () => store)
  vi.stubGlobal('useLocales', () => ({
    printLocale: (k: string) => k,
  }))
  return store
}

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
    mockShopStore()
  })

  it('показывает товары из watercolor (category_1)', async () => {
    const wrapper = await mountGallery()
    // 1 товар из category_1 в нашем mock ("Snow")
    expect(wrapper.text()).toContain('Snow')
    expect(wrapper.text()).not.toContain('Rain')
    expect(wrapper.text()).not.toContain('Cal 1')
  })

  it('не фильтрует по короткому id (регрессия: раньше сравнивали с "1")', async () => {
    const products = (globalThis as Record<string, unknown>).useShopStore = () => ({
      allProducts: ref([
        { id: 'x', title: 'OldCat1', price: 100, categoryId: '1', image: [], stock: 1, status: 'available', isReserved: false },
      ]),
      loadProducts: vi.fn(),
    })
    vi.stubGlobal('useShopStore', products)
    const wrapper = await mountGallery()
    // '1' (без префикса) НЕ должен матчиться — это была причина бага
    expect(wrapper.text()).not.toContain('OldCat1')
  })
})