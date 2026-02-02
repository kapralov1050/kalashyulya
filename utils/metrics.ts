// Обновленная структура для хранения на сервере
interface OptimizedMetric {
  t: number // timestamp в секундах
  c: number // counter
  n?: string // name (опционально, если нужна дополнительная информация)
}

export class MetricsTracker {
  private endpoint: string
  private metricsQueue: Map<string, OptimizedMetric> = new Map()

  constructor(endpoint: string) {
    this.endpoint = endpoint
    // Фоновое обновление каждые 10 секунд
    setInterval(() => this.flushMetrics(), 10000)
    // Принудительное обновление перед закрытием страницы
    window.addEventListener('beforeunload', () => this.flushMetrics())
  }

  // Генерация ключа для Map
  private getMetricKey(date: string, type: string, name: string): string {
    return `${date}|${type}|${name}`
  }

  // Отслеживание просмотра страницы
  trackPageView(pageName: string): void {
    this.trackMetric('page_view', pageName)
  }

  // Отслеживание клика по кнопке
  trackButtonClick(buttonName: string): void {
    this.trackMetric('button_click', buttonName)
  }

  private trackMetric(type: 'button_click' | 'page_view', name: string): void {
    const now = new Date()
    const date = this.formatDate(now)
    const timestamp = Math.floor(now.getTime() / 1000) // секунды вместо миллисекунд

    const key = this.getMetricKey(date, type, name)

    if (this.metricsQueue.has(key)) {
      // Инкрементируем счетчик, обновляем timestamp на последнее событие
      const existing = this.metricsQueue.get(key)!
      existing.c += 1
      existing.t = timestamp
    } else {
      // Добавляем новую метрику
      this.metricsQueue.set(key, {
        t: timestamp,
        c: 1,
        n: name, // Сохраняем имя для отправки, если нужно
      })
    }
  }

  // Форматируем дату в YYYY-MM-DD
  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Отправка накопленных метрик
  private flushMetrics(): void {
    if (this.metricsQueue.size === 0) return

    // Преобразуем Map в оптимизированный JSON формат
    const optimizedData: Record<string, Record<string, [number, number]>> = {}

    for (const [key, metric] of this.metricsQueue.entries()) {
      const [date, type, name] = key.split('|')

      if (!optimizedData[date]) optimizedData[date] = {}

      // Используем составной ключ: type_name для уникальности
      const compositeKey = `${type}_${name}`

      // [timestamp, counter] - самый компактный формат
      optimizedData[date][compositeKey] = [metric.t, metric.c]
    }

    // Отправляем оптимизированные данные
    this.sendOptimizedMetrics(optimizedData)

    // Очищаем очередь после отправки
    this.metricsQueue.clear()
  }

  private sendOptimizedMetrics(
    data: Record<string, Record<string, [number, number]>>,
  ): void {
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
      // Можно добавить повторную попытку или локальное хранение
    }
  }
}

const config = useRuntimeConfig()
export const metrics = new MetricsTracker(config.public.statsUpload)
