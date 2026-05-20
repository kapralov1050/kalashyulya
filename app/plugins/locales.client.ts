export default defineNuxtPlugin(async () => {
  const { fetchLocales } = useLocalesStore()

  // Загружаем локали при первой загрузке
  await fetchLocales()

  // Проверяем обновления локалей каждые 10 минут
  if (import.meta.client) {
    setInterval(async () => {
      try {
        await fetchLocales()
      } catch {
        // Игнорируем ошибки проверки обновлений
      }
    }, 10 * 60 * 1000)
  }
})
