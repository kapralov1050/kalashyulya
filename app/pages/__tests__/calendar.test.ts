import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Phase D migration: categoryId теперь с префиксом «category_<n>».

function createProducts() {
  return [
    { id: '1', title: 'Snow', price: 1000, categoryId: 'category_1', image: ['/x.jpg'], stock: 1, status: 'available', isReserved: false },
    { id: '3', title: 'Cal 1', price: 300, categoryId: 'category_5', image: ['/x.jpg'], stock: 1, status: 'available', isReserved: false },
    { id: '4', title: 'Cal 2', price: 300, categoryId: 'category_5', image: ['/x.jpg'], stock: 1, status: 'available', isReserved: false },
  ]
}

let mockProducts = createProducts()
let mockCatalog: ReturnType<typeof createProducts> = []
let mockLoading = false
let mockLoadError = false

vi.mock('~/stores/shop', () => ({
  useShopStore: () => ({
    get shopData() {
      return { products: Object.fromEntries(mockProducts.map(p => [p.id, p])) }
    },
    get allProducts() { return mockCatalog },
    get isLoading() { return mockLoading },
    get loadError() { return mockLoadError },
    loadProducts: vi.fn(),
  }),
}))

vi.mock('~/composables/useLocales', () => ({
  useLocales: () => ({
    printLocale: (k: string) => k,
  }),
}))

const stubs = {
  UButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
  ClientOnly: { template: '<slot />' },
  UIcon: true,
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
    vi.stubGlobal('useSeo', vi.fn())
    // gsap mock
    vi.stubGlobal('gsap', {
      registerPlugin: vi.fn(),
      fromTo: vi.fn(),
    })
    mockProducts = createProducts()
    mockCatalog = []
    mockLoading = false
    mockLoadError = false
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

  it('показывает цену и кнопку покупки у календаря в наличии', async () => {
    const wrapper = await mountCalendar()
    const text = wrapper.text().replace(/\s/g, ' ')

    expect(text).toContain('300 ₽')
    expect(text).toContain('shop_item_add_to_basket')
  })

  it('не показывает кнопку покупки у проданного календаря', async () => {
    mockProducts = [
      { id: '3', title: 'Cal 1', price: 300, categoryId: 'category_5', image: ['/x.jpg'], stock: 0, status: 'sold', isReserved: true },
    ]
    const wrapper = await mountCalendar()

    expect(wrapper.text()).toContain('Cal 1')
    expect(wrapper.text()).not.toContain('shop_item_add_to_basket')
  })

  it('не зависит от фильтров каталога', async () => {
    mockCatalog = [mockProducts[0]!]
    const wrapper = await mountCalendar()

    expect(wrapper.text()).toContain('Cal 1')
    expect(wrapper.text()).toContain('Cal 2')
  })

  it('показывает распроданный календарь со статусом и ставит его в конец', async () => {
    mockProducts = [
      { id: '3', title: 'Sold Cal', price: 300, categoryId: 'category_5', image: ['/x.jpg'], stock: 0, status: 'sold', isReserved: false },
      { id: '4', title: 'Fresh Cal', price: 300, categoryId: 'category_5', image: ['/x.jpg'], stock: 2, status: 'available', isReserved: false },
    ]
    const wrapper = await mountCalendar()
    const text = wrapper.text()

    expect(text).toContain('shop_item_sold')
    expect(text.indexOf('Fresh Cal')).toBeLessThan(text.indexOf('Sold Cal'))
  })

  it('при ошибке загрузки показывает сообщение, а не «нет в продаже»', async () => {
    mockProducts = []
    mockLoadError = true
    const wrapper = await mountCalendar()

    expect(wrapper.text()).toContain('Не удалось загрузить календари')
    expect(wrapper.text()).toContain('Загрузить снова')
    expect(wrapper.text()).not.toContain('нет в продаже')
  })

  it('пока товары грузятся, не показывает пустое состояние', async () => {
    mockProducts = []
    mockLoading = true
    const wrapper = await mountCalendar()

    expect(wrapper.text()).not.toContain('нет в продаже')
    expect(wrapper.text()).not.toContain('Не удалось')
  })
})
