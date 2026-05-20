import { getSnapshotByPath } from '~/helpers/firebase/manageDatabase'

export default defineNuxtRouteMiddleware(async to => {
  const authStore = useAuthStore()

  await authStore.waitForAuthInit()

  const user = authStore.currentUser
  const isLoginPage = to.path === '/login'
  const isAdminRoute = to.path.startsWith('/admin')

  if (!user?.uid) {
    if (!isLoginPage) {
      return navigateTo('/login')
    }
    return
  }

  if (isAdminRoute) {
    const snapshot = await getSnapshotByPath(`users/${user.uid}/role`)
    const role = snapshot.toString()

    if (role !== 'admin') {
      return navigateTo('/login')
    }
  }

  return
})
