import { type MaybeRefOrGetter, toValue } from 'vue'
import type { Product } from '~/types'

export function useProductModal(products?: MaybeRefOrGetter<Product[]>) {
  const route = useRoute()
  const router = useRouter()
  const shopStore = useShopStore()

  const selectedProductId = computed(() => route.query.id?.toString() || null)

  const selectedProduct = computed(() => {
    if (!selectedProductId.value) return null

    const productList = toValue(products)
    if (productList) {
      const found = productList.find(p => p.id.toString() === selectedProductId.value)
      if (found) return found
    }

    return shopStore.allProducts.find(
      p => p.id.toString() === selectedProductId.value,
    ) || null
  })

  const isProductModalOpen = computed(() => {
    return !!selectedProductId.value && !!selectedProduct.value
  })

  const openModal = (productId: string | number) => {
    router.push({
      query: {
        ...route.query,
        id: productId.toString(),
      },
    })
  }

  const closeModal = () => {
    if (route.query.id) {
      router.replace({ query: { ...route.query, id: undefined } })
    }
  }

  return {
    isProductModalOpen,
    selectedProductId,
    selectedProduct,
    openModal,
    closeModal,
  }
}
