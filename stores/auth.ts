import type { User } from 'firebase/auth'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)

  const setUser = (user: User | null) => (currentUser.value = user)

  return {
    currentUser,
    setUser,
  }
})
