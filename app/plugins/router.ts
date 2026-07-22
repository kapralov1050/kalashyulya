import { initMetrics, metrics, setMetricsEnabled } from '~/utils/metrics'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  initMetrics(config.public.statsUpload)

  const { hasAnalyticsConsent } = useCookieConsent()

  function applyConsent(): void {
    setMetricsEnabled(hasAnalyticsConsent())
  }

  applyConsent()

  const route = useRoute()

  onMounted(() => {
    if (!hasAnalyticsConsent()) return
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
      if (!hasAnalyticsConsent()) return
      metrics.trackPageView(path)
      metrics.startPageTimer(path)
    },
  )

  watch(
    () => useCookieConsent().cookieConsent?.analytics,
    () => applyConsent(),
  )
})
