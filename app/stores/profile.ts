import { defineStore } from 'pinia'
import type { OrderInBase } from '~/types'
import { useApi } from '~/composables/useApi'

export interface UserProfileData {
  name: string
  email: string
  orders?: OrderInBase[]
}

export const useProfileStore = defineStore('profile', () => {
  const api = useApi()

  async function loadUserOrders() {
    if (!api.currentUser.value?.uid) return
    await api.loadOrders()
  }

  return {
    userOrders: api.orders,
    loadUserOrders,
  }
})