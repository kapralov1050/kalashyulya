interface Metric {
  type: 'button_click' | 'page_view'
  name: string // название кнопки или страницы
  timestamp: string
  date: string // добавлено: YYYY-MM-DD
}

export class MetricsTracker {
  private endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  // Отслеживание просмотра страницы
  trackPageView(pageName: string): void {
    const now = new Date()
    const metric: Metric = {
      type: 'page_view',
      name: pageName,
      timestamp: now.toISOString(),
      date: this.formatDate(now), // YYYY-MM-DD
    }
    this.sendMetric(metric)
  }

  // Отслеживание клика по кнопке
  trackButtonClick(buttonName: string): void {
    const now = new Date()
    const metric: Metric = {
      type: 'button_click',
      name: buttonName,
      timestamp: now.toISOString(),
      date: this.formatDate(now), // YYYY-MM-DD
    }
    this.sendMetric(metric)
  }

  // Форматируем дату в YYYY-MM-DD
  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  private sendMetric(metric: Metric): void {
    try {
      fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
        keepalive: true,
      })
    } catch (error) {
      console.warn('Failed to send metric:', error)
    }
  }
}

const config = useRuntimeConfig()
export const metrics = new MetricsTracker(config.public.statsUpload)
