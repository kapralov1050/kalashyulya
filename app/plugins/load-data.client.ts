/**
 * Загружает все данные, которые раньше приходили реактивно из Firebase RTDB.
 * Вызывается один раз при старте клиента.
 */
export default defineNuxtPlugin(async () => {
  if (import.meta.server) return

  const api = useApi()

  // Параллельно грузим всё нужное для витрины
  await Promise.all([
    api.loadProducts().catch((err) => console.error('[init] loadProducts failed', err)),
    api.loadExhibitions().catch((err) => console.error('[init] loadExhibitions failed', err)),
  ])

  // Аутентификация — отдельным вызовом (не блокируем витрину)
  api.refreshCurrentUser().catch((err) => console.error('[init] auth refresh failed', err))
})