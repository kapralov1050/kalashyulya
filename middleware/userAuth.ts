import { getSnapshotByPath } from '~/helpers/firebase/manageDatabase'

export default defineNuxtRouteMiddleware(to => {
  const authStore = useAuthStore()
  const user = authStore.currentUser

  if (!user) {
    return navigateTo('/')
  }

  if (to.params.id && to.params.id !== user.uid) {
    return navigateTo(`/profile/${user.uid}`) // или показать ошибку 403
  }
})
