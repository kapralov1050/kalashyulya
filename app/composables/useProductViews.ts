import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { isDevOrPreview } from '~/utils/devGuard'

export const useProductViews = (productId: string) => {
  const viewsCount = ref(0)
  const viewsKey = `product-${productId}-viewed`
  const api = useApi()

  async function trackView() {
    if (isDevOrPreview()) {
      console.debug('[productViews] skipped: dev/preview environment')
      return
    }
    if (sessionStorage.getItem(viewsKey) || !productId) {
      console.debug('[productViews] skipped: already viewed or missing id')
      return
    }
    try {
      await api.trackProductView(productId)
      sessionStorage.setItem(viewsKey, 'true')
      console.debug(`[productViews] tracked: ${productId}`)
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