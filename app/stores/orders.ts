import { defineStore } from 'pinia'
import type { Order, OrderInBase } from '~/types'
import { useApi } from '~/composables/useApi'

export const useOrdersStore = defineStore('orders', () => {
  const api = useApi()

  const allOrders = computed<OrderInBase[]>(() => api.orders.value)
  const orderInfo = ref<Order | null>(null)

  async function loadOrders() {
    await api.loadOrders()
  }

  return { allOrders, orderInfo, loadOrders }
})