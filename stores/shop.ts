import type { Product } from '~/types'

import { useFirebase } from '~/composables/firebase/useFirebase'

export const useShopStore = defineStore('shop', () => {
  const { shopData } = useFirebase()

  const searchedProducts = ref<Product[] | null>(null)
  const categoryFilter = ref('')

  const allProducts = computed<Product[] | []>(() => {
    if (!shopData.value) return []

    const products = Object.values(shopData.value.products)

    if (!categoryFilter.value) {
      return products
    }

    return products.filter(prod => prod.categoryId === categoryFilter.value)
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
