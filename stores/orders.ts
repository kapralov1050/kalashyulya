import { useFirebase } from '~/composables/firebase/useFirebase'
import type { Order, OrderInBase } from '~/types'

export const useOrdersStore = defineStore('orders', () => {
  const { ordersData } = useFirebase()

  const allOrders = computed<OrderInBase[] | []>(() => {
    if (!ordersData.value) return []

    const orders = Object.values(ordersData.value)

    return orders
  })

  const orderInfo = ref<Order | null>(null)

  return {
    allOrders,
    orderInfo,
  }
})
