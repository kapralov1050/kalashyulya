import type { User } from 'firebase/auth'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isAuthReady = ref(false)

  const setUser = (user: User | null) => {
    currentUser.value = user
    isAuthReady.value = true
  }

  const waitForAuthInit = () => {
    return new Promise<void>(resolve => {
      if (isAuthReady.value) {
        resolve()
        return
      }

      const unsubscribe = onAuthStateChanged(getAuth(), user => {
        setUser(user)
        unsubscribe()
        resolve()
      })
    })
  }

  onAuthStateChanged(getAuth(), setUser)

  return {
    currentUser,
    isAuthReady,
    waitForAuthInit,
    setUser,
  }
})
