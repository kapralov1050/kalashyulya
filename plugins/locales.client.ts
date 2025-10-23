export default defineNuxtPlugin(async () => {
  const { fetchLocales } = useLocalesStore()
  const { locales } = storeToRefs(useLocalesStore())

  if (!locales.value) {
    await fetchLocales()
  }
})
