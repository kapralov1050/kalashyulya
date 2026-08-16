import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  const api = useApi()

  async function waitForAuthInit() {
    await api.refreshCurrentUser()
    return api.currentUser.value
  }

  return {
    currentUser: api.currentUser,
    isLoggedIn: api.isLoggedIn,
    waitForAuthInit,
  }
})