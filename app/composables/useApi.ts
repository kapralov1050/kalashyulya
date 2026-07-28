import { remove, ref as dbRef } from 'firebase/database'
import { computed, watch } from 'vue'
import { useFirebase } from '~/composables/firebase/useFirebase'
import { loginUser } from '~/helpers/firebase/authService'
import { updateDataByPath } from '~/helpers/firebase/manageDatabase'
import type {
  ExhibitionsData,
  LessonsTags,
  Order,
  OrderInBase,
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

export function useApi() {
  const {
    shopData,
    ordersData,
    exhibitionsData,
    addNewOrder,
    updateOrderStatus,
    addNewProduct,
    logOut,
  } = useFirebase()

  const orders = computed<OrderInBase[]>(() => ordersData.value ?? [])
  const exhibitions = computed<ExhibitionsData>(
    () => exhibitionsData.value ?? {},
  )
  const subscribers = computed<string[]>(() => [])

  async function addNewOrderApi(
    order: Order,
    path: string = 'orders/',
  ): Promise<string> {
    return addNewOrder(order, path)
  }

  async function setShopData(path: string, value: unknown): Promise<void> {
    await updateDataByPath(value as Record<string, unknown>, path)
  }

  async function removeShopData(path: string): Promise<void> {
    const db = useDatabase()
    await remove(dbRef(db, path))
  }

  async function updateLessonsTags(value: LessonsTags): Promise<void> {
    await updateDataByPath(value, 'lessonsTags')
  }

  function watchOrders(callback: (orders: OrderInBase[]) => void): () => void {
    const stop = watch(orders, v => callback(v), { immediate: true })
    return stop
  }

  function watchShopData(callback: (data: ShopData) => void): () => void {
    const stop = watch(
      shopData,
      v => callback(v as ShopData),
      { immediate: true },
    )
    return stop
  }

  const authStore = useAuthStore()

  const currentUser = computed<ApiUser | null>(() => {
    const u = authStore.currentUser
    return u ? { uid: u.uid, email: u.email } : null
  })
  const isLoggedIn = computed(() => currentUser.value !== null)

  async function login(
    email: string,
    password: string,
  ): Promise<ApiLoginResult> {
    const result = await loginUser(email, password)
    return {
      user: result.user ? { uid: result.user.uid, email: result.user.email } : null,
      error: result.error,
    }
  }

  async function logout(): Promise<void> {
    await logOut()
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
  }
}
