import { initMetrics, metrics } from '~/utils/metrics'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  initMetrics(config.public.statsUpload)

  const route = useRoute()

  onMounted(() => {
    metrics.trackPageView(route.path)
  })

  watch(
    () => route.path,
    path => {
      metrics.trackPageView(path)
    },
  )
})
