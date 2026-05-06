import { initMetrics, metrics } from '~/utils/metrics'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  initMetrics(config.public.statsUpload)

  const route = useRoute()

  onMounted(() => {
    metrics.trackPageView(route.path)
    metrics.startPageTimer(route.path)
    metrics.trackReferrer()
    metrics.trackDevice()
    metrics.trackVisitorType()
  })

  watch(
    () => route.path,
    path => {
      metrics.endPageTimer()
      metrics.trackPageView(path)
      metrics.startPageTimer(path)
    },
  )
})
