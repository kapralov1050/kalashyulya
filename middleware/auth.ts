import { useFirebase } from '~/composables/firebase/useFirebase'

export default defineNuxtRouteMiddleware((to, from) => {
  const { isAdmin } = useFirebase()

  const admin = isAdmin()

  if (to.path.startsWith('/admin') && !admin) {
    return navigateTo('/admin/login')
  }

  if (to.path === '/admin/login' && admin) {
    return navigateTo('/admin/dashboard')
  }
})
