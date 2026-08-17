import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const useProfileStore = defineStore('profile', () => {
  const api = useApi()

  /**
   * Загружает заказы текущего пользователя. Раньше фильтровалось по `uid` —
   * в новой модели авторизации uid нет, заказы пока не привязаны к user.id
   * (нужна отдельная миграция для бэкфилла user_id в orders).
   * Пока просто грузим все заказы — фильтрация переедет на сервер.
   */
  async function loadUserOrders(): Promise<void> {
    if (!api.currentUser.value) return
    await api.loadOrders()
  }

  return {
    userOrders: api.orders,
    loadUserOrders,
  }
})