import { ref } from 'vue'
import { useApi } from '~/composables/useApi'

export const useProductViews = (productId: string) => {
  const viewsCount = ref(0)
  const viewsKey = `product-${productId}-viewed`
  const api = useApi()

  async function trackView() {
    if (sessionStorage.getItem(viewsKey) || !productId) return
    try {
      await api.updateProduct(productId, {
        views: ((api.shopData.value?.products?.[productId]?.views ?? 0) + 1),
      })
      sessionStorage.setItem(viewsKey, 'true')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error tracking product view:', error)
    }
  }

  function getViews() {
    const product = api.shopData.value?.products?.[productId]
    viewsCount.value = product?.views ?? 0
    return viewsCount
  }

  return { trackView, getViews }
}