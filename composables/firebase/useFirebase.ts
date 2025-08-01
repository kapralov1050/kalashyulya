import type { Product, ShopData } from '~/types'
import { ref as dbRef } from 'firebase/database'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { updateDataByPath } from '~/helpers/firebase/manageDatabase'

export const useFirebase = () => {
  const db = useDatabase()
  const shopData = useDatabaseObject<ShopData>(dbRef(db, 'shop'))
  const auth = getAuth()

  async function addNewProduct(product: Omit<Product, 'id'>) {
    try {
      const id = await updateDataByPath(product, `shop/products/`)
      console.log(id)
    } catch (error) {
      console.log(error)
    }
  }

  async function login(
    email: string,
    password: string,
  ): Promise<User | undefined> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      )
      return userCredential.user
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

  const isAdmin = () => {
    const user = auth.currentUser
    const {
      public: { adminUid },
    } = useRuntimeConfig()

    if (!user) {
      return false
    }

    return adminUid === user.uid
  }

  return {
    shopData,
    login,
    isAdmin,
    logOut,
    addNewProduct,
  }
}
