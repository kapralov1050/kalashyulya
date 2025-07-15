import type { Product, ShopData } from '~/types'
import { ref as dbRef } from 'firebase/database'

export const useShopStore = defineStore('shop', () => {
  const db = useDatabase()
  const shopData = useDatabaseObject<ShopData>(dbRef(db, 'shop'))

  const searchedProducts = ref<Product[] | null>(null)
  const categoryFilter = ref('')

  const allProducts = computed<Product[] | []>(() => {
    if (!shopData.value) return []

    return shopData.value
      .flatMap(category =>
        category.items.map(item => ({
          ...item,
          category: category.category,
          categoryId: category.id,
        })),
      )
      .filter(item => {
        if (!categoryFilter.value) return true

        return item.category === categoryFilter.value
      })
  })

  const findProduct = (searchQry: string) => {
    if (!allProducts) return []

    return allProducts.value.filter(prod =>
      prod.title.toLowerCase().includes(searchQry.toLowerCase()),
    )
  }

  return {
    findProduct,
    searchedProducts,
    shopData,
    allProducts,
    categoryFilter,
  }
})
