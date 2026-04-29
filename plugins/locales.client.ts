export default defineNuxtPlugin(async () => {
  const { fetchLocales } = useLocalesStore()
  await fetchLocales()
})
