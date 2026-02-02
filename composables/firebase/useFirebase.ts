import { getAuth } from 'firebase/auth'
import { ref as dbRef, set } from 'firebase/database'
import {
  getSnapshotByPath,
  updateDataByPath,
} from '~/helpers/firebase/manageDatabase'
import type {
  ExhibitionsData,
  LessonsTags,
  Order,
  OrderInBase,
  Product,
  ShopData,
} from '~/types'

export const useFirebase = () => {
  const db = useDatabase()
  const shopData = useDatabaseObject<ShopData>(dbRef(db, 'shop'))
  const ordersData = useDatabaseObject<OrderInBase[]>(dbRef(db, 'orders'))
  const lessonsTagsData = useDatabaseObject<LessonsTags>(
    dbRef(db, 'lessonsTags'),
  )
  const exhibitionsData = useDatabaseObject<ExhibitionsData>(
    dbRef(db, 'exhibitions'),
  )
  const auth = getAuth()

  const isLoading = computed(() => shopData.value == undefined)

  async function addNewProduct(product: Omit<Product, 'id'>, path: string) {
    try {
      const snapshot = await getSnapshotByPath(path)
      const maxId =
        Math.max(...Object.keys(snapshot).map(prod => +prod.split('_')[1])) + 1
      const newItemWithId: Product = { ...product, id: maxId }

      await updateDataByPath(newItemWithId, `${path}product_${maxId}`)

      return true
    } catch (error) {
      return error
    }
  }

  async function addNewOrder(order: Order, path: string) {
    const snapshot = await getSnapshotByPath(path)
    const maxId =
      Math.max(...Object.keys(snapshot).map(prod => +prod.split('_')[1])) + 1
    const newItemWithId: OrderInBase = {
      ...order,
      id: maxId,
      status: 'Новый заказ',
    }

    await updateDataByPath(newItemWithId, `${path}order_${maxId}`)
  }

  async function updateOrderStatus(orderId: number, status: string) {
    const orderRef = dbRef(db, `orders/order_${orderId}/status`)
    await set(orderRef, status)
  }

  async function logOut() {
    try {
      await auth.signOut()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error signing out:', error)
    }
  }

  return {
    shopData,
    ordersData,
    lessonsTagsData,
    exhibitionsData,
    isLoading,
    logOut,
    addNewProduct,
    addNewOrder,
    updateOrderStatus,
  }
}
