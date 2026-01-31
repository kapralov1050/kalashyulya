import { computed, type Ref } from 'vue'
import type { StatsData } from '~/types'

/**
 * Интерфейс для обработанных данных статистики
 */
export interface ProcessedEvent {
  name: string
  counter: number
  last_updated: string
  type: 'page_view' | 'button_click'
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

/**
 * Composable для обработки сырых данных статистики
 * @param stats - сырые данные статистики из стора
 * @returns объект с обработанными данными и вспомогательными функциями
 */
export const useStatsDataProcessing = (stats: Ref<StatsData | null>) => {
  /**
   * Обработанные данные, сгруппированные по годам, месяцам и дням
   */
  const processedStats = computed<ProcessedYear[]>(() => {
    if (!stats.value) return []

    const result: ProcessedYear[] = []

    // Проходим по датам (новый формат: "2025-12-07")
    Object.entries(stats.value).forEach(([dateString, events]) => {
      // Парсим дату из строки "2025-12-07"
      const [year, month, day] = dateString.split('-')

      // Находим или создаем год
      let yearData = result.find(y => y.year === year)
      if (!yearData) {
        yearData = {
          year,
          months: [],
        }
        result.push(yearData)
      }

      // Находим или создаем месяц
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

      // Создаем день
      const dayStats: ProcessedDay = {
        day,
        date: dateString,
        events: [],
        totalEvents: 0,
        pageViews: 0,
        buttonClicks: 0,
      }

      // Обрабатываем события дня (новый формат: "type_name": [timestamp, counter])
      Object.entries(events).forEach(([eventKey, eventData]) => {
        // Парсим тип и имя из ключа "page_view_calendar"
        const [type, ...nameParts] = eventKey.split('_')
        const name = nameParts.join('_')

        // Преобразуем timestamp в миллисекунды
        const timestamp = eventData[0] * 1000

        const event: ProcessedEvent = {
          name,
          counter: eventData[1],
          last_updated: new Date(timestamp).toISOString(),
          type: type === 'page' ? 'page_view' : 'button_click',
        }

        dayStats.events.push(event)
        dayStats.totalEvents += eventData[1]

        if (type === 'page') {
          dayStats.pageViews += eventData[1]
        } else {
          dayStats.buttonClicks += eventData[1]
        }
      })

      monthData.days.push(dayStats)
      monthData.totalEvents += dayStats.totalEvents
    })

    // Сортируем дни по убыванию даты
    result.forEach(yearData => {
      yearData.months.forEach(monthData => {
        monthData.days.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      })
      // Сортируем месяцы по убыванию
      yearData.months.sort((a, b) => Number(b.month) - Number(a.month))
    })

    // Сортируем годы по убыванию
    result.sort((a, b) => Number(b.year) - Number(a.year))

    return result
  })

  /**
   * Получить отфильтрованные события по типу
   */
  const getEventsByType = (day: ProcessedDay, eventType: 'page_view' | 'button_click') => {
    return day.events.filter(e => e.type === eventType)
  }

  return {
    processedStats,
    getEventsByType,
  }
}

/**
 * Вспомогательная функция для получения названия месяца
 * (вынесена отдельно для возможности переиспользования)
 */
function getMonthName(monthNumber: string): string {
  const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ]
  return months[parseInt(monthNumber) - 1] || monthNumber
}
