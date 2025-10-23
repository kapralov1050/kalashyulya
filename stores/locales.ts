export const useLocalesStore = defineStore('locales', () => {
  const locales = ref<Record<string, string> | null>(null)

  async function fetchLocales() {
    const data = await $fetch<Record<string, string>>(
      'https://storage.yandexcloud.net/kalashyulya-locales/kalashyulya-shop-locales.json',
    )
    locales.value = data // data будет массивом строк
  }

  return { locales, fetchLocales }
})
