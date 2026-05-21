import type { StatsData } from '~/types/metrics'

export const useStatsStore = defineStore('stats', () => {
  const stats = ref<StatsData | null>(null)
  const config = useRuntimeConfig()

  async function fetchStats() {
    const blob = await $fetch<Blob>(`${config.public.stats}`, {
      responseType: 'blob',
    })

    const text = await blob.text()
    const data = JSON.parse(text)
    stats.value = data
  }

  return {
    stats,
    fetchStats,
  }
})
