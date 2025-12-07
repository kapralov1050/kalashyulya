import { metrics } from '~/utils/metrics'

export const useMetrics = () => {
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
}
