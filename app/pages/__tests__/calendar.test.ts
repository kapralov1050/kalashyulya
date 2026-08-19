import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Phase D migration: categoryId теперь с префиксом «category_<n>».
// Раньше код сравнивал со старыми Firebase id (числами) — после миграции
// ничего не матчилось → /calendar был пустой.

function createProducts() {
  return [
    { id: '1', title: 'Snow', price: 1000, categoryId: 'category_1', image: ['/x.jpg'], stock: 1, status: 'available', isReserved: false },
    { id: '3', title: 'Cal 1', price: 300, categoryId: 'category_5', image: ['/x.jpg'], stock: 1, status: 'available', isReserved: false },
    { id: '4', title: 'Cal 2', price: 300, categoryId: 'category_5', image: ['/x.jpg'], stock: 1, status: 'available', isReserved: false },
  ]
}

function mockShopStore(products = createProducts()) {
  const data = ref(products)
  vi.stubGlobal('useShopStore', () => ({
    allProducts: data,
    loadProducts: vi.fn(),
  }))
  vi.stubGlobal('useLocales', () => ({
    printLocale: (k: string) => k,
  }))
}

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
  vi.stubGlobal('useRoute', () => ({ query: {} }))
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
  })

  it('показывает календари из category_5', async () => {
    mockShopStore()
    const wrapper = await mountCalendar()
    expect(wrapper.text()).toContain('Cal 1')
    expect(wrapper.text()).toContain('Cal 2')
    expect(wrapper.text()).not.toContain('Snow')
  })

  it('не фильтрует по короткому id (регрессия: раньше сравнивали с "5")', async () => {
    mockShopStore([
      { id: 'x', title: 'OldCat5', price: 100, categoryId: '5', image: [], stock: 1, status: 'available', isReserved: false },
    ])
    const wrapper = await mountCalendar()
    expect(wrapper.text()).not.toContain('OldCat5')
  })

  it('показывает пусто если нет календарей', async () => {
    mockShopStore([
      { id: '1', title: 'Snow', price: 1000, categoryId: 'category_1', image: [], stock: 1, status: 'available', isReserved: false },
    ])
    const wrapper = await mountCalendar()
    expect(wrapper.text()).not.toContain('Cal ')
  })
})