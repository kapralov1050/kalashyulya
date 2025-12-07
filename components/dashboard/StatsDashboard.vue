<template>
  <div class="min-h-screen p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Статистика</h1>
        <p class="text-gray-600 mt-2">Аналитика переходов и кликов</p>
      </div>

      <!-- Кнопка обновления -->
      <div class="mb-6">
        <button
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="fetchStats"
        >
          <span v-if="loading">Обновление...</span>
          <span v-else>Обновить статистику</span>
        </button>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2
            border-blue-600"
        ></div>
        <p class="mt-2 text-gray-600">Загрузка статистики...</p>
      </div>

      <!-- Состояние ошибки -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- Контент -->
      <div v-else-if="processedStats.length > 0" class="space-y-8">
        <div
          v-for="yearData in processedStats"
          :key="yearData.year"
          class="space-y-6"
        >
          <h2 class="text-2xl font-semibold text-gray-800 border-b pb-2">
            {{ yearData.year }} год
          </h2>

          <div class="space-y-8">
            <div
              v-for="monthData in yearData.months"
              :key="`${yearData.year}-${monthData.month}`"
              class="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <!-- Заголовок месяца -->
              <div class="bg-gray-100 px-6 py-4 border-b">
                <h3 class="text-xl font-semibold text-gray-800">
                  {{ getMonthName(monthData.month) }}
                </h3>
                <p class="text-gray-600 text-sm mt-1">
                  Всего событий: {{ monthData.totalEvents }}
                </p>
              </div>

              <!-- Дни месяца -->
              <div class="divide-y">
                <div
                  v-for="dayData in monthData.days"
                  :key="`${yearData.year}-${monthData.month}-${dayData.day}`"
                  class="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-medium text-gray-900">
                      {{ dayData.day }} {{ getMonthName(monthData.month) }}
                    </h4>
                    <span class="text-sm text-gray-500">
                      {{ formatDate(dayData.date) }}
                    </span>
                  </div>

                  <!-- Статистика по событиям -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Переходы на страницы -->
                    <div class="space-y-3">
                      <h5
                        class="font-medium text-gray-700 text-sm uppercase
                          tracking-wide"
                      >
                        Переходы на страницы
                      </h5>
                      <div class="space-y-2">
                        <div
                          v-for="event in dayData.events.filter(
                            e => e.type === 'page_view',
                          )"
                          :key="event.name"
                          class="flex items-center justify-between p-3
                            bg-blue-50 rounded-lg"
                        >
                          <div>
                            <p class="font-medium text-blue-900">
                              {{ formatEventName(event.name) }}
                            </p>
                            <p class="text-sm text-blue-700">Переход</p>
                          </div>
                          <div class="text-right">
                            <p class="text-2xl font-bold text-blue-900">
                              {{ event.counter }}
                            </p>
                            <p class="text-xs text-blue-600">
                              {{ formatLastUpdated(event.last_updated) }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Клики на кнопки -->
                    <div class="space-y-3">
                      <h5
                        class="font-medium text-gray-700 text-sm uppercase
                          tracking-wide"
                      >
                        Клики на кнопки
                      </h5>
                      <div class="space-y-2">
                        <div
                          v-for="event in dayData.events.filter(
                            e => e.type === 'button_click',
                          )"
                          :key="event.name"
                          class="flex items-center justify-between p-3
                            bg-green-50 rounded-lg"
                        >
                          <div>
                            <p class="font-medium text-green-900">
                              {{ formatEventName(event.name) }}
                            </p>
                            <p class="text-sm text-green-700">Клик</p>
                          </div>
                          <div class="text-right">
                            <p class="text-2xl font-bold text-green-900">
                              {{ event.counter }}
                            </p>
                            <p class="text-xs text-green-600">
                              {{ formatLastUpdated(event.last_updated) }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Общая статистика дня -->
                  <div class="mt-4 pt-4 border-t">
                    <div class="flex items-center justify-between text-sm">
                      <div class="flex items-center space-x-4">
                        <span class="flex items-center">
                          <span
                            class="w-3 h-3 bg-blue-500 rounded-full mr-1"
                          ></span>
                          <span class="text-gray-600">
                            Переходы: {{ dayData.pageViews }}
                          </span>
                        </span>
                        <span class="flex items-center">
                          <span
                            class="w-3 h-3 bg-green-500 rounded-full mr-1"
                          ></span>
                          <span class="text-gray-600">
                            Клики: {{ dayData.buttonClicks }}
                          </span>
                        </span>
                      </div>
                      <span class="font-medium text-gray-900">
                        Всего: {{ dayData.totalEvents }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Состояние отсутствия данных -->
      <div v-else class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg
            class="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p class="text-gray-500 text-lg">Нет данных для отображения</p>
        <button
          class="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          @click="fetchStats"
        >
          Загрузить статистику
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useStatsStore } from '~/stores/stats'

  const statsStore = useStatsStore()
  const loading = ref(false)
  const error = ref(null)

  // Обработанные данные для удобного отображения
  const processedStats = computed(() => {
    if (!statsStore.stats) return []

    const result = []

    // Проходим по годам
    Object.entries(statsStore.stats).forEach(([year, yearData]) => {
      const yearStats = {
        year,
        months: [],
      }

      // Проходим по месяцам
      Object.entries(yearData).forEach(([month, monthData]) => {
        const monthStats = {
          month,
          monthName: getMonthName(month),
          days: [],
          totalEvents: 0,
        }

        // Проходим по дням
        Object.entries(monthData).forEach(([day, dayData]) => {
          const dayStats = {
            day,
            date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
            events: [],
            totalEvents: 0,
            pageViews: 0,
            buttonClicks: 0,
          }

          // Проходим по событиям дня
          Object.entries(dayData).forEach(([eventName, eventData]) => {
            const event = {
              name: eventName,
              counter: eventData.counter,
              last_updated: eventData.last_updated,
              type: eventData.type,
            }

            dayStats.events.push(event)
            dayStats.totalEvents += eventData.counter

            if (eventData.type === 'page_view') {
              dayStats.pageViews += eventData.counter
            } else if (eventData.type === 'button_click') {
              dayStats.buttonClicks += eventData.counter
            }
          })

          monthStats.days.push(dayStats)
          monthStats.totalEvents += dayStats.totalEvents
        })

        // Сортируем дни по убыванию
        monthStats.days.sort((a, b) => b.day - a.day)

        yearStats.months.push(monthStats)
      })

      // Сортируем месяцы по убыванию
      yearStats.months.sort((a, b) => b.month - a.month)

      result.push(yearStats)
    })

    // Сортируем годы по убыванию
    result.sort((a, b) => b.year - a.year)

    return result
  })

  // Функции форматирования
  const getMonthName = monthNumber => {
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

  const formatDate = dateString => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatLastUpdated = timestamp => {
    const date = new Date(timestamp)
    return `обновлено: ${date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  const formatEventName = name => {
    // Преобразуем имена для красивого отображения
    const nameMap = {
      calendar: 'Переходов на страницу календарей',
      shop: 'Переходов в магазин',
      productExtendedButton: 'Открывал карточку товара',
      startOrderButton: 'Начинал оформление заказа',
      completeOrderButton: 'Закончил оформление заказа',
      vkButton: 'Переходы во Вконтакте',
      telegramButton: 'Переходы в Телеграм',
    }

    return nameMap[name] || name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Функция загрузки данных
  async function fetchStats() {
    loading.value = true
    error.value = null

    try {
      await statsStore.fetchStats()
    } catch (err) {
      error.value =
        'Ошибка при загрузке статистики. Пожалуйста, попробуйте позже.'
      console.error('Error fetching stats:', err)
    } finally {
      loading.value = false
    }
  }

  // Загружаем данные при монтировании
  onMounted(() => {
    if (!statsStore.stats) {
      fetchStats()
    }
  })
</script>

<style scoped>
  /* Анимации */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
