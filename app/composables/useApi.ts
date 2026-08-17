import { computed, ref, watch } from 'vue'
import type {
  Exhibition,
  ExhibitionDto,
  Order,
  OrderInBase,
  Product,
  ShopData,
} from '~/types'

export interface ApiUser {
  uid: string
  email: string | null
  name?: string | null
}

export interface ApiLoginResult {
  user: ApiUser | null
  error: string | null
}

const shopData = ref<ShopData>({ categories: {}, products: {} })
const ordersData = ref<OrderInBase[]>([])
const exhibitionsData = ref<Exhibition[]>([])
const currentUser = ref<ApiUser | null>(null)

export function useApi() {
  const orders = computed<OrderInBase[]>(() => ordersData.value)
  const exhibitions = computed<Exhibition[]>(() => exhibitionsData.value)

  const productsById = computed<Record<string, Product>>(() =>
    Object.fromEntries((shopData.value.products ?? {}) && Object.values(shopData.value.products).length > 0
      ? Object.values(shopData.value.products).map(p => [String(p.id), p])
      : []),
  )

  const isLoggedIn = computed(() => currentUser.value !== null)

  async function loadOrders(): Promise<void> {
    ordersData.value = await $fetch<OrderInBase[]>('/api/orders')
  }

  async function loadProducts(): Promise<void> {
    const data = await $fetch<Product[]>('/api/products')
    shopData.value = {
      ...(shopData.value ?? {}),
      products: Object.fromEntries(data.map(p => [String(p.id), p])),
    }
  }

  async function loadExhibitions(): Promise<void> {
    exhibitionsData.value = await $fetch<ExhibitionDto[]>('/api/exhibitions')
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
  ): Promise<{ id: string }> {
    return await $fetch<{ id: string }>('/api/admin/products', {
      method: 'POST',
      body: product,
    })
  }

  async function updateProduct(
    id: string,
    patch: Partial<Product>,
  ): Promise<void> {
    await $fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: patch,
    })
  }

  async function deleteProduct(id: string): Promise<void> {
    await $fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
  }

  async function updateOrderStatus(
    orderId: string,
    status: 'new' | 'paid' | 'shipped' | 'cancelled',
  ): Promise<void> {
    await $fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      body: { status },
    })
  }

  async function updateProductCertificateId(
    productId: string,
    certificateId: string | null,
  ): Promise<void> {
    await $fetch(`/api/admin/products/${productId}`, {
      method: 'PUT',
      body: { certificateId },
    })
  }

  async function publishExhibition(id: string): Promise<void> {
    await $fetch(`/api/admin/exhibitions/${id}/publish`, { method: 'POST' })
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
    productsById,
    addNewOrder: addNewOrderApi,
    addNewProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    updateProductCertificateId,
    publishExhibition,
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