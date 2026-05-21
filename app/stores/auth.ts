import type { User } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isAuthReady = ref(false)
  let _initPromise: Promise<User | null> | null = null

  function waitForAuthInit(): Promise<User | null> {
    if (isAuthReady.value) return Promise.resolve(currentUser.value)
    if (_initPromise) return _initPromise

    _initPromise = import('firebase/auth').then(
      ({ getAuth, onAuthStateChanged }) => {
        return new Promise<User | null>(resolve => {
          onAuthStateChanged(getAuth(), user => {
            currentUser.value = user
            if (!isAuthReady.value) {
              isAuthReady.value = true
              resolve(user)
            }
          })
        })
      },
    )

    return _initPromise
  }

  return { currentUser, isAuthReady, waitForAuthInit }
})
