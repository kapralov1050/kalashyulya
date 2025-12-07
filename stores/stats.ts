export const useStatsStore = defineStore('stats', () => {
  const stats = ref<import('~/types/metrics').StatsData | null>(null)
  const config = useRuntimeConfig()

  async function fetchStats() {
    const blob = await $fetch<Blob>(
      'https://storage.yandexcloud.net/kalashyulya.stats/stats.json',
      {
        responseType: 'blob',
      },
    )

    const text = await blob.text()
    const data = JSON.parse(text)
    stats.value = data
  }

  return {
    stats,
    fetchStats,
  }
})
