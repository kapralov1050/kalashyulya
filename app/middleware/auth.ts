export default defineNuxtRouteMiddleware(async to => {
  const authStore = useAuthStore()

  const user = await authStore.waitForAuthInit()
  const isLoginPage = to.path === '/login'

  if (!user?.id) {
    if (!isLoginPage) return navigateTo('/login')
    return
  }

  return
})