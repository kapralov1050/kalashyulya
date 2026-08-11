import { computed, ref, watch } from 'vue'
import type {
  ExhibitionsData,
  Exhibition,
  LessonsTags,
  Order,
  OrderInBase,
  Product,
  ShopData,
} from '~/types'


export interface ApiUser {
  uid: string
  email: string | null
}

export interface ApiLoginResult {
  user: ApiUser | null
  error: string | null
}

const shopData = ref<ShopData>({})
const ordersData = ref<OrderInBase[]>([])
const exhibitionsData = ref<ExhibitionsData>({})
const currentUser = ref<ApiUser | null>(null)

export function useApi() {
  const orders = computed<OrderInBase[]>(() =>
    ordersData.value ?? [],
  )
  const exhibitions = computed<ExhibitionsData>(
    () => exhibitionsData.value ?? {},
  )
  const subscribers = computed<string[]>(() => [])
  const isLoggedIn = computed(() => currentUser.value !== null)

  async function loadOrders(): Promise<void> {
    const data = await $fetch<OrderInBase[]>('/api/orders')
    ordersData.value = data
  }

  async function loadProducts(): Promise<void> {
    const data = await $fetch<Product[]>('/api/products')
    shopData.value = {
      ...(shopData.value ?? {}),
      products: Object.fromEntries(data.map(p => [String(p.id), p])),
    }
  }

  async function loadExhibitions(): Promise<void> {
    const data = await $fetch<Exhibition[]>('/api/exhibitions')
    exhibitionsData.value = Object.fromEntries(
      data.map(e => [String(e.id), e]),
    )
  }

  async function addNewOrderApi(
    order: Order,
    _path: string = 'orders/',
  ): Promise<string> {
    const { id } = await $fetch<{ id: string }>('/api/orders', {
      method: 'POST',
      body: order,
    })
    return id
  }

  async function addNewProduct(
    product: Omit<Product, 'id'>,
    _path: string,
  ): Promise<unknown> {
    return await $fetch('/api/products', {
      method: 'POST',
      body: product,
    })
  }

  async function updateOrderStatus(
    orderId: number,
    status: string,
  ): Promise<void> {
    await $fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: { status },
    })
  }

  async function setShopData(path: string, value: unknown): Promise<void> {
    await $fetch(`/api/data/${encodeURIComponent(path)}`, {
      method: 'PUT',
      body: { value },
    })
  }

  async function removeShopData(path: string): Promise<void> {
    await $fetch(`/api/data/${encodeURIComponent(path)}`, {
      method: 'DELETE',
    })
  }

  async function updateLessonsTags(value: LessonsTags): Promise<void> {
    await $fetch('/api/lessons-tags', {
      method: 'PUT',
      body: value,
    })
  }

  function watchOrders(callback: (orders: OrderInBase[]) => void): () => void {
    let cancelled = false
    const poll = async () => {
      while (!cancelled) {
        try {
          const data = await $fetch<OrderInBase[]>('/api/orders')
          ordersData.value = data
          callback(data)
        } catch {
          // ignore poll errors
        }
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
    poll()
    return () => {
      cancelled = true
    }
  }

  function watchShopData(callback: (data: ShopData) => void): () => void {
    let cancelled = false
    const poll = async () => {
      while (!cancelled) {
        try {
          const products = await $fetch<Product[]>('/api/products')
          const next: ShopData = {
            ...(shopData.value ?? {}),
            products: Object.fromEntries(products.map(p => [String(p.id), p])),
          }
          shopData.value = next
          callback(next)
        } catch {
          // ignore poll errors
        }
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
    poll()
    return () => {
      cancelled = true
    }
  }

  async function login(
    email: string,
    password: string,
  ): Promise<ApiLoginResult> {
    try {
      const { user } = await $fetch<{ user: ApiUser }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      currentUser.value = user
      return { user, error: null }
    } catch (err) {
      return {
        user: null,
        error: err instanceof Error ? err.message : 'Ошибка авторизации',
      }
    }
  }

  async function logout(): Promise<void> {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      currentUser.value = null
    }
  }

  async function refreshCurrentUser(): Promise<void> {
    try {
      const { user } = await $fetch<{ user: ApiUser | null }>('/api/auth/me')
      currentUser.value = user
    } catch {
      currentUser.value = null
    }
  }

  function onAuthStateChanged(
    callback: (user: ApiUser | null) => void,
  ): () => void {
    return watch(currentUser, u => callback(u), { immediate: true })
  }

  return {
    shopData,
    orders,
    exhibitions,
    subscribers,
    addNewOrder: addNewOrderApi,
    addNewProduct,
    updateOrderStatus,
    setShopData,
    removeShopData,
    updateLessonsTags,
    watchOrders,
    watchShopData,
    currentUser,
    isLoggedIn,
    login,
    logout,
    onAuthStateChanged,
    loadOrders,
    loadProducts,
    loadExhibitions,
    refreshCurrentUser,
  }
}
