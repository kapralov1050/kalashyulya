import { getAuth } from 'firebase/auth'
import { ref as dbRef } from 'firebase/database'
import {
  getSnapshotByPath,
  updateDataByPath,
} from '~/helpers/firebase/manageDatabase'
import type {
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
    const newItemWithId: OrderInBase = { ...order, id: maxId }

    await updateDataByPath(newItemWithId, `${path}order_${maxId}`)
  }

  async function logOut() {
    try {
      await auth.signOut()
      console.log('User signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    shopData,
    ordersData,
    lessonsTagsData,
    isLoading,
    logOut,
    addNewProduct,
    addNewOrder,
  }
}
