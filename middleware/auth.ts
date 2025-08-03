import { getSnapshotByPath } from '~/helpers/firebase/manageDatabase'

export default defineNuxtRouteMiddleware(async to => {
  const authStore = useAuthStore()

  if (!authStore.currentUser?.uid) {
    return navigateTo('/login')
  }

  if (to.path === '/login' || !to.path.startsWith('/admin')) {
    return
  }

  const snapshot = await getSnapshotByPath(
    `users/${authStore.currentUser.uid}/role`,
  )
  const role = snapshot.toString()

  if (role !== 'admin') {
    return navigateTo('/login')
  }
})
