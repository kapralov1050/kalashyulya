interface OptimizedMetric {
  t: number // timestamp в секундах
  c: number // counter (для type=time — секунды на странице)
}

type MetricType = 'button_click' | 'page_view' | 'referrer' | 'device' | 'visitor' | 'time'

export class MetricsTracker {
  private endpoint: string
  private metricsQueue: Map<string, OptimizedMetric> = new Map()
  private pageStartTime = 0
  private currentPagePath = ''

  constructor(endpoint: string) {
    this.endpoint = endpoint
    setInterval(() => this.flushMetrics(), 10000)
    window.addEventListener('beforeunload', () => {
      this.endPageTimer()
      this.flushMetrics()
    })
  }

  private getMetricKey(date: string, type: string, name: string): string {
    return `${date}|${type}|${name}`
  }

  trackPageView(pageName: string): void {
    this.trackMetric('page_view', pageName)
  }

  trackButtonClick(buttonName: string): void {
    this.trackMetric('button_click', buttonName)
  }

  trackReferrer(): void {
    if (typeof document === 'undefined') return
    const ref = document.referrer
    let source = 'direct'
    if (ref) {
      if (ref.includes('vk.com') || ref.includes('vkontakte.ru')) source = 'vk'
      else if (ref.includes('t.me') || ref.includes('telegram')) source = 'telegram'
      else if (ref.includes('google.')) source = 'google'
      else if (ref.includes('yandex.')) source = 'yandex'
      else if (ref.includes('instagram.com')) source = 'instagram'
      else source = 'other'
    }
    this.trackMetric('referrer', source)
  }

  trackDevice(): void {
    if (typeof window === 'undefined') return
    const ua = navigator.userAgent
    const w = window.innerWidth
    let device = 'desktop'
    if (/mobile/i.test(ua) || w < 768) device = 'mobile'
    else if (/tablet|ipad/i.test(ua) || w < 1024) device = 'tablet'
    this.trackMetric('device', device)
  }

  trackVisitorType(): void {
    if (typeof localStorage === 'undefined') return
    const isReturning = !!localStorage.getItem('_v')
    localStorage.setItem('_v', '1')
    this.trackMetric('visitor', isReturning ? 'returning' : 'new')
  }

  startPageTimer(path: string): void {
    this.pageStartTime = Date.now()
    this.currentPagePath = path
  }

  endPageTimer(): void {
    if (!this.pageStartTime || !this.currentPagePath) return
    const seconds = Math.floor((Date.now() - this.pageStartTime) / 1000)
    this.pageStartTime = 0
    if (seconds < 2) return
    this.trackTimeDuration(this.currentPagePath, seconds)
    this.currentPagePath = ''
  }

  private trackTimeDuration(path: string, seconds: number): void {
    const now = new Date()
    const date = this.formatDate(now)
    const timestamp = Math.floor(now.getTime() / 1000)
    const key = this.getMetricKey(date, 'time', path)
    const existing = this.metricsQueue.get(key)
    if (existing) {
      existing.c += seconds
      existing.t = timestamp
    } else {
      this.metricsQueue.set(key, { t: timestamp, c: seconds })
    }
  }

  private trackMetric(type: MetricType, name: string): void {
    const now = new Date()
    const date = this.formatDate(now)
    const timestamp = Math.floor(now.getTime() / 1000)
    const key = this.getMetricKey(date, type, name)
    const existing = this.metricsQueue.get(key)
    if (existing) {
      existing.c += 1
      existing.t = timestamp
    } else {
      this.metricsQueue.set(key, { t: timestamp, c: 1 })
    }
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  private shouldSendMetrics(): boolean {
    if (typeof window === 'undefined') return false
    const { hostname, href } = window.location
    if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) return false
    if (href.includes('kalashyulya.vercel.app')) return false
    return true
  }

  private flushMetrics(): void {
    if (this.metricsQueue.size === 0) return
    const optimizedData: Record<string, Record<string, [number, number]>> = {}
    for (const [key, metric] of this.metricsQueue.entries()) {
      const [date, type, name] = key.split('|')
      if (!optimizedData[date]) optimizedData[date] = {}
      optimizedData[date][`${type}_${name}`] = [metric.t, metric.c]
    }
    this.sendOptimizedMetrics(optimizedData)
    this.metricsQueue.clear()
  }

  private sendOptimizedMetrics(
    data: Record<string, Record<string, [number, number]>>,
  ): void {
    if (!this.shouldSendMetrics()) return
    try {
      fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to send metrics:', error)
    }
  }
}

let _instance: MetricsTracker | null = null

export function initMetrics(endpoint: string) {
  _instance = new MetricsTracker(endpoint)
}

export const metrics = {
  trackPageView: (p: string) => _instance?.trackPageView(p),
  trackButtonClick: (b: string) => _instance?.trackButtonClick(b),
  trackReferrer: () => _instance?.trackReferrer(),
  trackDevice: () => _instance?.trackDevice(),
  trackVisitorType: () => _instance?.trackVisitorType(),
  startPageTimer: (p: string) => _instance?.startPageTimer(p),
  endPageTimer: () => _instance?.endPageTimer(),
}
