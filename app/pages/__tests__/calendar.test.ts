import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Phase D migration: categoryId теперь с префиксом «category_<n>».
// calendar.vue и Gallery.vue делают прямой доступ `shopStore.allProducts.filter(...)`,
// как в реальном Pinia setup-store (auto-unwrap). Mock через getter возвращает
// массив — те же getter-семантики что Pinia unwrap'ает в production.

function createProducts() {
  return [
    { id: '1', title: 'Snow', price: 1000, categoryId: 'category_1', image: ['/x.jpg'], stock: 1, status: 'available', isReserved: false },
    { id: '3', title: 'Cal 1', price: 300, categoryId: 'category_5', image: ['/x.jpg'], stock: 1, status: 'available', isReserved: false },
    { id: '4', title: 'Cal 2', price: 300, categoryId: 'category_5', image: ['/x.jpg'], stock: 1, status: 'available', isReserved: false },
  ]
}

let mockProducts = createProducts()

vi.mock('~/stores/shop', () => ({
  useShopStore: () => ({
    get allProducts() { return mockProducts },
    loadProducts: vi.fn(),
  }),
}))

vi.mock('~/composables/useLocales', () => ({
  useLocales: () => ({
    printLocale: (k: string) => k,
  }),
}))

const stubs = {
  AppHeroImage: { template: '<img :src="imageSrc" />', props: ['imageSrc'] },
  AppHeroContent: { template: '<div><slot name="title" /><slot name="buttons" /></div>' },
  UButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
  ClientOnly: { template: '<slot />' },
}

async function mountCalendar() {
  vi.stubGlobal('useRouter', () => ({ push: vi.fn() }))
  vi.stubGlobal('useRoute', () => ({ query: {} }))
  vi.stubGlobal('useNuxtApp', () => ({}))
  vi.stubGlobal('$fetch', () => Promise.resolve({}))
  const Calendar = (await import('../../pages/calendar.vue')).default
  const wrapper = mount(Calendar, {
    global: { stubs, plugins: [createPinia()] },
  })
  await nextTick()
  return wrapper
}

describe('/calendar (categories products)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('useNuxtApp', () => ({}))
    vi.stubGlobal('$fetch', () => Promise.resolve({}))
    vi.stubGlobal('metrics', { trackButtonClick: vi.fn() })
    vi.stubGlobal('scrollTo', () => {})
    // gsap mock
    vi.stubGlobal('gsap', {
      registerPlugin: vi.fn(),
      fromTo: vi.fn(),
    })
    mockProducts = createProducts()
  })

  it('показывает календари из category_5', async () => {
    const wrapper = await mountCalendar()
    expect(wrapper.text()).toContain('Cal 1')
    expect(wrapper.text()).toContain('Cal 2')
    expect(wrapper.text()).not.toContain('Snow')
  })

  it('не фильтрует по короткому id (регрессия: раньше сравнивали с "5")', async () => {
    mockProducts = [
      { id: 'x', title: 'OldCat5', price: 100, categoryId: '5', image: [], stock: 1, status: 'available', isReserved: false },
    ]
    const wrapper = await mountCalendar()
    expect(wrapper.text()).not.toContain('OldCat5')
  })

  it('показывает пусто если нет календарей', async () => {
    mockProducts = [
      { id: '1', title: 'Snow', price: 1000, categoryId: 'category_1', image: [], stock: 1, status: 'available', isReserved: false },
    ]
    const wrapper = await mountCalendar()
    expect(wrapper.text()).not.toContain('Cal ')
  })
})