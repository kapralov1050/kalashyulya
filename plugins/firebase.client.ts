import { defineNuxtPlugin } from '#app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const auth = getAuth()
  const authStore = useAuthStore()

  onAuthStateChanged(auth, user => {
    authStore.setUser(user)
  })
})
