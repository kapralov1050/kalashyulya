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
  id: number
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
    Object.fromEntries(
      (shopData.value.products ?? {}) &&
        Object.values(shopData.value.products).length > 0
        ? Object.values(shopData.value.products).map(p => [String(p.id), p])
        : [],
    ),
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

  /**
   * Обновляет статус заказа через админку. Сервер сам триггерит email
   * покупателю с информацией о смене (если sendEmail !== false). Возвращает
   * результат email-отправки, чтобы UI мог показать toast при сбое SMTP.
   * Если status не изменился — возвращает { email: null, noChange: true }
   * (без side-effects).
   */
  async function updateOrderStatus(
    orderId: string,
    status: 'new' | 'paid' | 'shipped' | 'cancelled',
    options: { sendEmail?: boolean; message?: string } = {},
  ): Promise<{
    email: { ok: boolean; error?: string } | null
    noChange?: boolean
  }> {
    return await $fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      body: {
        status,
        sendEmail: options.sendEmail !== false,
        message: options.message,
      },
    } as never)
  }

  async function deleteOrder(orderId: string | number): Promise<void> {
    // Cast нужен: Nitro typed-routes не знает про DELETE-handler до npx nuxt prepare.
    await $fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' } as never)
  }

  /**
   * Сменить способ оплаты существующего заказа на ручной (перевод на карту).
   * Используется на /shop/payment-success (payment-result.vue) когда у пользователя не получилось
   * оплатить через ЮKassa и он хочет переключиться на ручную оплату.
   * Кидает ошибку, если заказ в финальном статусе ('paid'/'shipped'/'cancelled').
   */
  async function updateOrderPaymentMethod(
    orderId: string,
    paymentMethod: 'manual',
  ): Promise<void> {
    await $fetch(`/api/orders/${orderId}/payment-method`, {
      method: 'PATCH',
      body: { paymentMethod },
    })
  }

  /**
   * Отправить продавцу уведомление о заказе: email покупателю + Telegram продавцу.
   * Используется на /shop/payment-success (payment-result.vue) когда способ оплаты уже финальный
   * (succeeded от ЮKassa, либо после успешного switchToManual). Сервер читает
   * актуальный payment_method из БД и формирует оба уведомления с правильным
   * способом оплаты. Best-effort: при ошибке UI не ломается (только console.warn).
   *
   * Гарантия: для yookassa-заказов вызывается ровно один раз — либо в polling
   * (succeeded), либо после switchToManual. Для manual-заказов — в orders.post
   * (этот метод НЕ вызывается).
   */
  async function notifySeller(orderId: string): Promise<void> {
    try {
      // Nitro typed-routes не видит POST /api/orders/[id]/notify-seller до npx nuxt prepare.
      // any-cast чтобы обойти. Реальный сервер корректно отвечает POST.
      await $fetch(`/api/orders/${orderId}/notify-seller`, {
        method: 'POST',
      } as never)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[notify-seller] failed for ${orderId}:`, err)
    }
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

  /**
   * Инкрементировать счётчик просмотров товара.
   * Публичный endpoint (без auth) — для анонимных посетителей.
   * Не кидает ошибку: если запрос не прошёл — UI продолжит работать.
   */
  async function trackProductView(productId: string): Promise<void> {
    // Nitro typed-routes не видит dynamic POST-роут (/${productId}/view),
    // any-cast чтобы обойти. Реальный сервер корректно отвечает POST.
    await $fetch(`/api/products/${productId}/view`, { method: 'POST' } as never)
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
    updateOrderPaymentMethod,
    notifySeller,
    deleteOrder,
    trackProductView,
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
