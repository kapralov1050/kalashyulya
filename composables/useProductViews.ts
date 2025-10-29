import {
  ref as dbRef,
  getDatabase,
  increment,
  onValue,
  update,
} from 'firebase/database'
import { ref } from 'vue'

export const useProductViews = (productId: string) => {
  const db = getDatabase()
  const viewsCount = ref(0)
  const viewsKey = `product-${productId}-viewed`

  const trackView = async () => {
    if (sessionStorage.getItem(viewsKey)) return

    try {
      const updates = {} as Record<string, any>
      updates[`shop/products/product_${productId}/views`] = increment(1)
      await update(dbRef(db), updates)
      sessionStorage.setItem(viewsKey, 'true')
    } catch (error) {
      console.error('Error tracking product view:', error)
    }
  }

  const getViews = () => {
    const viewsRef = dbRef(db, `shop/products/product_${productId}/views`)
    onValue(viewsRef, snapshot => {
      viewsCount.value = snapshot.val()
    })

    return viewsCount
  }

  return {
    trackView,
    getViews,
  }
}
