import type { LessonsTags, Product, ShopData } from '~/types'
import { ref as dbRef } from 'firebase/database'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import type { User } from 'firebase/auth'
import {
  getSnapshotByPath,
  updateDataByPath,
} from '~/helpers/firebase/manageDatabase'

export const useFirebase = () => {
  const db = useDatabase()
  const shopData = useDatabaseObject<ShopData>(dbRef(db, 'shop'))
  const lessonsTagsData = useDatabaseObject<LessonsTags>(
    dbRef(db, 'lessonsTags'),
  )
  const auth = getAuth()

  async function addNewProduct(product: Omit<Product, 'id'>, path: string) {
    try {
      const snapshot = await getSnapshotByPath(path)
      const maxId =
        Math.max(...Object.keys(snapshot).map(prod => +prod.split('_')[1])) + 1
      const newItemWithId: Product = { ...product, id: maxId }

      await updateDataByPath(newItemWithId, `${path}product_${maxId}`)
    } catch (error) {
      console.log(error)
    }
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
    lessonsTagsData,
    logOut,
    addNewProduct,
  }
}
