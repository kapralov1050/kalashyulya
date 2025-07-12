import type { Product, ShopData } from '~/types'
import { useDatabaseList } from 'vuefire'
import { ref as dbRef } from 'firebase/database'

export const useShopStore = defineStore('shop', () => {
  const db = useDatabase()
  const products = useDatabaseObject<ShopData>(dbRef(db, 'shop'))

  const searchedResults = ref<
    | { item: Product; categoryName: string; categoryId: number }
    | null
    | undefined
  >()

  const searchProducts = (
    title: string,
  ):
    | { item: Product; categoryName: string; categoryId: number }
    | null
    | undefined => {
    if (!products.value) return null

    for (const category of products.value) {
      const foundItem = category.items.find(item => {
        return item.title.toLowerCase().includes(title.toLowerCase())
      })

      if (foundItem) {
        return {
          item: foundItem,
          categoryName: category.name,
          categoryId: category.id,
        }
      }
    }
  }

  return {
    searchedResults,
    products,
    searchProducts,
  }
})
