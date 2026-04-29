export const useLocalesStore = defineStore('locales', () => {
  const locales = ref<Record<string, string> | null>(null)
  const localesVersion = ref<string | null>(null)
  const config = useRuntimeConfig()

  async function fetchLocales() {
    const blob = await $fetch<Blob>(`${config.public.locales}?v=${Date.now()}`, {
      responseType: 'blob',
    })

    const text = await blob.text()
    const data = JSON.parse(text)

    const newVersion = data._version || ''
    localesVersion.value = newVersion

    // Удаляем служебное поле версии перед сохранением
    const { _version, ...cleanLocales } = data
    locales.value = cleanLocales
  }

  async function updateLocales(newLocales: Record<string, string>) {
    try {
      const newVersion = new Date()
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '')

      const dataWithVersion = {
        _version: newVersion,
        ...newLocales,
      }

      await $fetch(`${config.public.cloudFunctionUploadLocales}`, {
        method: 'POST',
        body: {
          fileName: 'kalashyulya-shop-locales.json',
          jsonData: dataWithVersion,
        },
      })

      localesVersion.value = newVersion
      locales.value = newLocales
    } catch (err) {
      // eslint-disable-next-line no-console
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
