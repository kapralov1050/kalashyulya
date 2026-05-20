<template>
  <div class="min-h-screen p-4 md:p-6">
    <div class="max-w-7xl mx-auto">

      <!-- Шапка -->
      <div class="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Статистика</h1>
          <p class="text-gray-500 mt-1">Аналитика переходов и кликов</p>
        </div>
        <button
          :disabled="loading"
          class="flex-shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors text-sm font-medium"
          @click="fetchStats"
        >
          {{ loading ? 'Обновление...' : 'Обновить' }}
        </button>
      </div>

      <!-- KPI-карточки -->
      <div v-if="kpiData" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Просмотры</p>
          <p class="text-3xl font-bold text-blue-600 mt-1">{{ kpiData.totalPageViews }}</p>
          <p class="text-xs text-gray-400 mt-1">за всё время</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Клики</p>
          <p class="text-3xl font-bold text-green-600 mt-1">{{ kpiData.totalButtonClicks }}</p>
          <p class="text-xs text-gray-400 mt-1">за всё время</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Топ страница</p>
          <p class="text-xl font-bold text-purple-600 mt-1 truncate">
            {{ kpiData.topPage ? formatEventName(kpiData.topPage.name) : '—' }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            {{ kpiData.topPage ? kpiData.topPage.count + ' посещений' : 'нет данных' }}
          </p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Конверсия</p>
          <p class="text-3xl font-bold text-amber-600 mt-1">{{ kpiData.conversion }}%</p>
          <p class="text-xs text-gray-400 mt-1">
            корзина → оплата ({{ kpiData.addToBasketCount }} → {{ kpiData.paymentSuccessCount }})
          </p>
        </div>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p class="mt-3 text-gray-500">Загрузка статистики...</p>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- Основной контент -->
      <template v-else-if="processedStats.length > 0">
        <!-- Табы -->
        <div class="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          <button
            v-for="tab in TABS"
            :key="tab.key"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            ]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Таб: Графики -->
        <StatsCharts v-if="activeTab === 'charts'" :stats-data="statsStore.stats" />

        <!-- Таб: По дням -->
        <div v-else class="space-y-6">
          <div v-for="yearData in processedStats" :key="yearData.year">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">{{ yearData.year }} год</h2>
            <div class="space-y-3">
              <div
                v-for="monthData in yearData.months"
                :key="`${yearData.year}-${monthData.month}`"
                class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <!-- Заголовок месяца (кликабельный) -->
                <button
                  class="w-full flex items-center justify-between px-5 py-4
                    hover:bg-gray-50 transition-colors"
                  @click="toggleMonth(yearData.year, monthData.month)"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-lg font-semibold text-gray-800">{{ monthData.monthName }}</span>
                    <span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {{ monthData.totalEvents }} событий
                    </span>
                  </div>
                  <svg
                    :class="['w-5 h-5 text-gray-400 transition-transform', isMonthExpanded(yearData.year, monthData.month) ? 'rotate-180' : '']"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Дни месяца -->
                <div v-show="isMonthExpanded(yearData.year, monthData.month)" class="divide-y divide-gray-50">
                  <div v-for="dayData in monthData.days" :key="dayData.date" class="px-5 py-3">

                    <!-- Кнопка-заголовок дня -->
                    <button class="w-full flex items-center justify-between" @click="toggleDay(dayData.date)">
                      <span class="text-sm font-medium text-gray-700 text-left">
                        {{ formatDate(dayData.date) }}
                      </span>
                      <div class="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span
                          v-if="getDayTrend(dayData.date)?.pageViews !== null && getDayTrend(dayData.date)?.pageViews !== undefined"
                          :class="['text-xs font-medium hidden sm:inline', trendClass(getDayTrend(dayData.date)?.pageViews)]"
                        >
                          👁 {{ trendText(getDayTrend(dayData.date)?.pageViews) }}
                        </span>
                        <span
                          v-if="getDayTrend(dayData.date)?.clicks !== null && getDayTrend(dayData.date)?.clicks !== undefined"
                          :class="['text-xs font-medium hidden sm:inline', trendClass(getDayTrend(dayData.date)?.clicks)]"
                        >
                          🖱 {{ trendText(getDayTrend(dayData.date)?.clicks) }}
                        </span>
                        <svg
                          :class="['w-4 h-4 text-gray-400 transition-transform', expandedDays.has(dayData.date) ? 'rotate-180' : '']"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    <!-- Детали дня -->
                    <div v-show="expandedDays.has(dayData.date)" class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">

                      <!-- Просмотры страниц -->
                      <div>
                        <h5 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Переходы</h5>
                        <div class="space-y-1.5">
                          <div
                            v-for="event in getEventsByType(dayData, 'page_view')"
                            :key="event.name"
                            class="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg"
                          >
                            <div>
                              <p class="text-sm font-medium text-blue-900">{{ formatEventName(event.name) }}</p>
                              <p class="text-xs text-blue-400">{{ formatLastUpdated(event.last_updated) }}</p>
                            </div>
                            <p class="text-xl font-bold text-blue-800 ml-2">{{ event.counter }}</p>
                          </div>
                          <p v-if="!getEventsByType(dayData, 'page_view').length" class="text-xs text-gray-400 italic px-1">нет данных</p>
                        </div>
                      </div>

                      <!-- Клики по кнопкам -->
                      <div>
                        <h5 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Клики</h5>
                        <div class="space-y-1.5">
                          <div
                            v-for="event in getEventsByType(dayData, 'button_click')"
                            :key="event.name"
                            class="flex items-center justify-between p-2.5 bg-green-50 rounded-lg"
                          >
                            <div>
                              <p class="text-sm font-medium text-green-900">{{ formatEventName(event.name) }}</p>
                              <p class="text-xs text-green-400">{{ formatLastUpdated(event.last_updated) }}</p>
                            </div>
                            <p class="text-xl font-bold text-green-800 ml-2">{{ event.counter }}</p>
                          </div>
                          <p v-if="!getEventsByType(dayData, 'button_click').length" class="text-xs text-gray-400 italic px-1">нет данных</p>
                        </div>
                      </div>

                      <!-- Дополнительные метрики -->
                      <div v-if="getAdditionalEvents(dayData).length" class="md:col-span-2">
                        <h5 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Дополнительно</h5>
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                          <div
                            v-for="event in getAdditionalEvents(dayData)"
                            :key="`${event.type}-${event.name}`"
                            class="flex items-center justify-between p-2.5 bg-indigo-50 rounded-lg"
                          >
                            <div class="min-w-0 mr-2">
                              <p class="text-xs font-medium text-indigo-900 truncate">{{ formatEventName(event.name) }}</p>
                              <p class="text-xs text-indigo-400">{{ EVENT_TYPE_LABEL[event.type] }}</p>
                            </div>
                            <p class="text-sm font-bold text-indigo-800 flex-shrink-0">
                              {{ event.type === 'time' ? formatDuration(event.counter) : event.counter }}
                            </p>
                          </div>
                        </div>
                      </div>

                      <!-- Итог дня -->
                      <div class="md:col-span-2 pt-2 border-t border-gray-100">
                        <div class="flex items-center justify-between text-xs text-gray-500">
                          <div class="flex gap-4">
                            <span>
                              <span class="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1" />
                              Просмотры: <b class="text-gray-700">{{ dayData.pageViews }}</b>
                            </span>
                            <span>
                              <span class="inline-block w-2 h-2 rounded-full bg-green-400 mr-1" />
                              Клики: <b class="text-gray-700">{{ dayData.buttonClicks }}</b>
                            </span>
                          </div>
                          <span class="font-medium text-gray-700">Итого: {{ dayData.totalEvents }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Пустое состояние -->
      <div v-else class="text-center py-16">
        <svg
          class="w-14 h-14 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p class="text-gray-400 text-lg mb-3">Нет данных для отображения</p>
        <button class="text-blue-600 hover:text-blue-800 text-sm font-medium" @click="fetchStats">
          Загрузить статистику
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useStatsStore } from '~/stores/stats'
  import StatsCharts from './StatsCharts.vue'
  import {
    formatDate,
    formatEventName,
    formatLastUpdated,
  } from '~/utils/statsFormatters'
  import { useStatsDataProcessing } from '~/composables/useStatsDataProcessing'

  const TABS = [
    { key: 'charts', label: 'Графики' },
    { key: 'days', label: 'По дням' },
  ]

  const EVENT_TYPE_LABEL = {
    referrer: 'источник',
    device: 'устройство',
    visitor: 'посетитель',
    time: 'время',
    page_view: 'просмотр',
    button_click: 'клик',
  }

  const statsStore = useStatsStore()
  const loading = ref(false)
  const error = ref(null)
  const activeTab = ref('charts')
  const expandedDays = ref(new Set())

  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const expandedMonths = ref(new Set([currentMonthKey]))

  const { processedStats, kpiData, getEventsByType, getDayTrend } =
    useStatsDataProcessing(computed(() => statsStore.stats))

  const getAdditionalEvents = day =>
    day.events.filter(e => ['referrer', 'device', 'visitor', 'time'].includes(e.type))

  const toggleDay = date => {
    if (expandedDays.value.has(date)) expandedDays.value.delete(date)
    else expandedDays.value.add(date)
  }

  const toggleMonth = (year, month) => {
    const key = `${year}-${month}`
    if (expandedMonths.value.has(key)) expandedMonths.value.delete(key)
    else expandedMonths.value.add(key)
  }

  const isMonthExpanded = (year, month) =>
    expandedMonths.value.has(`${year}-${month}`)

  const trendClass = val => {
    if (val == null) return 'text-gray-400'
    if (val > 0) return 'text-green-600'
    if (val < 0) return 'text-red-500'
    return 'text-gray-400'
  }

  const trendText = val => {
    if (val == null) return ''
    if (val > 0) return `+${val}%`
    if (val < 0) return `${val}%`
    return '0%'
  }

  const formatDuration = sec => {
    const m = Math.floor(sec / 60)
    return m > 0 ? `${m}м ${sec % 60}с` : `${sec}с`
  }

  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      await statsStore.fetchStats()
    } catch (err) {
      error.value = 'Ошибка при загрузке статистики. Попробуйте позже.'
      // eslint-disable-next-line no-console
      console.error('Error fetching stats:', err)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    if (!statsStore.stats) fetchStats()
  })
</script>
