/**
 * Загружает все данные, которые раньше приходили реактивно из Firebase RTDB.
 * Вызывается один раз при старте клиента.
 */
export default defineNuxtPlugin(async () => {
  if (import.meta.server) return

  const api = useApi()

  // Параллельно грузим всё нужное для витрины
  await Promise.all([
    api.loadProducts().catch(() => {}),
    api.loadExhibitions().catch(() => {}),
  ])

  // Аутентификация — отдельным вызовом (не блокируем витрину)
  api.refreshCurrentUser().catch(() => {})
})