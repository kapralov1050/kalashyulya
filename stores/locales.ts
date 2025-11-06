export const useLocalesStore = defineStore('locales', () => {
  const locales = ref<Record<string, string> | null>(null)
  const config = useRuntimeConfig()

  async function fetchLocales() {
    const blob = await $fetch<Blob>(
      'https://storage.yandexcloud.net/kalashyulya-locales/kalashyulya-shop-locales.json',
      {
        responseType: 'blob',
      },
    )

    const text = await blob.text()
    const data = JSON.parse(text)
    locales.value = data
  }

  async function updateLocales(newLocales: Record<string, string>) {
    try {
      await $fetch(`${config.public.cloudFunctionUploadLocales}`, {
        method: 'POST',
        body: {
          fileName: 'kalashyulya-shop-locales.json',
          jsonData: newLocales,
        },
      })
      locales.value = newLocales
    } catch (err) {
      console.log(err)
    }
  }

  async function deleteLocale(key: string) {
    if (!locales.value) return
    
    const { [key]: _, ...updatedLocales } = locales.value
    await updateLocales(updatedLocales)
  }

  return {
    locales,
    fetchLocales,
    updateLocales,
    deleteLocale,
  }
})
