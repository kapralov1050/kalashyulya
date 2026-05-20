import { computed, type Ref } from 'vue'
import { getMonthName } from '~/utils/statsFormatters'

export type StatsData = Record<string, Record<string, [number, number]>>

export type ProcessedEventType =
  | 'page_view'
  | 'button_click'
  | 'referrer'
  | 'device'
  | 'visitor'
  | 'time'

export interface ProcessedEvent {
  name: string
  counter: number
  last_updated: string
  type: ProcessedEventType
}

export interface ProcessedDay {
  day: string
  date: string
  events: ProcessedEvent[]
  totalEvents: number
  pageViews: number
  buttonClicks: number
}

export interface ProcessedMonth {
  month: string
  monthName: string
  days: ProcessedDay[]
  totalEvents: number
}

export interface ProcessedYear {
  year: string
  months: ProcessedMonth[]
}

export interface KpiData {
  totalPageViews: number
  totalButtonClicks: number
  topPage: { name: string; count: number } | null
  conversion: number
  addToBasketCount: number
  paymentSuccessCount: number
}

export interface DayTrend {
  pageViews: number | null
  clicks: number | null
}

function parseEventKey(eventKey: string): { type: ProcessedEventType; name: string } {
  if (eventKey.startsWith('page_view_'))
    return { type: 'page_view', name: eventKey.slice('page_view_'.length) }
  if (eventKey.startsWith('button_click_'))
    return { type: 'button_click', name: eventKey.slice('button_click_'.length) }
  if (eventKey.startsWith('referrer_'))
    return { type: 'referrer', name: eventKey.slice('referrer_'.length) }
  if (eventKey.startsWith('device_'))
    return { type: 'device', name: eventKey.slice('device_'.length) }
  if (eventKey.startsWith('visitor_'))
    return { type: 'visitor', name: eventKey.slice('visitor_'.length) }
  if (eventKey.startsWith('time_'))
    return { type: 'time', name: eventKey.slice('time_'.length) }

  // Legacy format: page_view_calendar → type='page', name='view_calendar'
  const [firstPart] = eventKey.split('_')
  if (firstPart === 'page') return { type: 'page_view', name: eventKey.slice('page_'.length) }
  return { type: 'button_click', name: eventKey }
}

export const useStatsDataProcessing = (stats: Ref<StatsData | null>) => {
  const processedStats = computed<ProcessedYear[]>(() => {
    if (!stats.value) return []

    const result: ProcessedYear[] = []

    Object.entries(stats.value).forEach(([dateString, events]) => {
      const [year, month] = dateString.split('-')

      let yearData = result.find(y => y.year === year)
      if (!yearData) {
        yearData = { year, months: [] }
        result.push(yearData)
      }

      let monthData = yearData.months.find(m => m.month === month)
      if (!monthData) {
        monthData = {
          month,
          monthName: getMonthName(month),
          days: [],
          totalEvents: 0,
        }
        yearData.months.push(monthData)
      }

      const dayStats: ProcessedDay = {
        day: dateString.split('-')[2],
        date: dateString,
        events: [],
        totalEvents: 0,
        pageViews: 0,
        buttonClicks: 0,
      }

      Object.entries(events).forEach(([eventKey, eventData]) => {
        if (!Array.isArray(eventData) || eventData.length < 2) return

        const { type, name } = parseEventKey(eventKey)
        const timestamp = eventData[0] * 1000

        const event: ProcessedEvent = {
          name,
          counter: eventData[1],
          last_updated: new Date(timestamp).toISOString(),
          type,
        }

        dayStats.events.push(event)

        // Only page_view and button_click count toward totals
        if (type === 'page_view') {
          dayStats.pageViews += eventData[1]
          dayStats.totalEvents += eventData[1]
        } else if (type === 'button_click') {
          dayStats.buttonClicks += eventData[1]
          dayStats.totalEvents += eventData[1]
        }
      })

      monthData.days.push(dayStats)
      monthData.totalEvents += dayStats.totalEvents
    })

    result.forEach(yearData => {
      yearData.months.forEach(monthData => {
        monthData.days.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
      })
      yearData.months.sort((a, b) => Number(b.month) - Number(a.month))
    })

    result.sort((a, b) => Number(b.year) - Number(a.year))

    return result
  })

  const dayLookup = computed<Map<string, ProcessedDay>>(() => {
    const map = new Map<string, ProcessedDay>()
    processedStats.value.forEach(year =>
      year.months.forEach(month =>
        month.days.forEach(day => map.set(day.date, day)),
      ),
    )
    return map
  })

  const kpiData = computed<KpiData | null>(() => {
    if (!processedStats.value.length) return null

    let totalPageViews = 0
    let totalButtonClicks = 0
    const pageViewCounts: Record<string, number> = {}
    let addToBasketCount = 0
    let paymentSuccessCount = 0

    processedStats.value.forEach(year =>
      year.months.forEach(month =>
        month.days.forEach(day => {
          totalPageViews += day.pageViews
          totalButtonClicks += day.buttonClicks

          day.events.forEach(event => {
            if (event.type === 'page_view') {
              pageViewCounts[event.name] =
                (pageViewCounts[event.name] || 0) + event.counter
            }
            if (event.name === 'addToBasket') addToBasketCount += event.counter
            if (event.name === 'paymentSuccess') paymentSuccessCount += event.counter
          })
        }),
      ),
    )

    const topPageEntry = Object.entries(pageViewCounts).sort(
      (a, b) => b[1] - a[1],
    )[0]

    return {
      totalPageViews,
      totalButtonClicks,
      topPage: topPageEntry
        ? { name: topPageEntry[0], count: topPageEntry[1] }
        : null,
      conversion:
        addToBasketCount > 0
          ? Math.round((paymentSuccessCount / addToBasketCount) * 100)
          : 0,
      addToBasketCount,
      paymentSuccessCount,
    }
  })

  const getEventsByType = (day: ProcessedDay, eventType: ProcessedEventType) =>
    day.events.filter(e => e.type === eventType)

  const getDayTrend = (date: string): DayTrend | null => {
    const current = dayLookup.value.get(date)
    if (!current) return null

    const prevDate = new Date(date)
    prevDate.setDate(prevDate.getDate() - 1)
    const prevStr = prevDate.toISOString().split('T')[0]
    const prev = dayLookup.value.get(prevStr)
    if (!prev) return null

    return {
      pageViews:
        prev.pageViews === 0
          ? null
          : Math.round(
              ((current.pageViews - prev.pageViews) / prev.pageViews) * 100,
            ),
      clicks:
        prev.buttonClicks === 0
          ? null
          : Math.round(
              ((current.buttonClicks - prev.buttonClicks) /
                prev.buttonClicks) *
                100,
            ),
    }
  }

  return {
    processedStats,
    kpiData,
    getEventsByType,
    getDayTrend,
  }
}
