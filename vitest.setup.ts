import { vi, beforeEach, beforeAll } from 'vitest'
import {
  ref,
  computed,
  watch,
  watchEffect,
  reactive,
  toRef,
  toRefs,
  readonly,
  nextTick,
  shallowRef,
  shallowReactive,
  onMounted,
  onUnmounted,
  onBeforeMount,
  onBeforeUnmount,
  onUpdated,
} from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'

// Expose Vue, Pinia, and Vue Router primitives for Nuxt auto-import compatibility
Object.assign(globalThis, {
  ref,
  computed,
  watch,
  watchEffect,
  reactive,
  toRef,
  toRefs,
  readonly,
  nextTick,
  shallowRef,
  shallowReactive,
  onMounted,
  onUnmounted,
  onBeforeMount,
  onBeforeUnmount,
  onUpdated,
  defineStore,
  storeToRefs,
  useRouter,
  useRoute,
})

beforeAll(async () => {
  // Import stores after globals are set up so defineStore is available
  const { useBasketStore } = await import('~/stores/basket')
  const { useShopStore } = await import('~/stores/shop')
  Object.assign(globalThis, { useBasketStore, useShopStore })
})

beforeEach(() => {
  vi.clearAllMocks()
})

// Mock Nuxt composables
// Real Pinia store definition so storeToRefs works (avoids null.effect TypeError)
const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<null>(null)
  const isAuthReady = ref(false)
  return { currentUser, isAuthReady }
})
;(globalThis as Record<string, unknown>).useAuthStore = useAuthStore

;(globalThis as Record<string, unknown>).useLocales = vi.fn(() => ({
  printLocale: vi.fn((key: string) => key),
}))

;(globalThis as Record<string, unknown>).useFirebase = vi.fn(() => ({
  isLoading: { value: false },
  shopData: { value: { products: {} } },
}))

;(globalThis as Record<string, unknown>).metrics = {
  trackButtonClick: vi.fn(),
}

;(globalThis as Record<string, unknown>).useToast = vi.fn(() => ({
  add: vi.fn(),
}))

;(globalThis as Record<string, unknown>).useDaDataAddress = vi.fn(() => ({
  suggestions: ref([]),
  fetchAddresses: vi.fn(),
}))

;(globalThis as Record<string, unknown>).useShop = vi.fn(() => ({
  sendOrderInfoTelegram: vi.fn(),
  sendOrderInfoEmail: vi.fn(),
  addOrderToUser: vi.fn(),
  createOrder: vi.fn(),
}))

const useOrdersStore = defineStore('orders', () => {
  const orderInfo = ref<null>(null)
  return { orderInfo }
})
;(globalThis as Record<string, unknown>).useOrdersStore = useOrdersStore
