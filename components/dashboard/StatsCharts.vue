<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import { BarChart, FunnelChart, LineChart } from 'echarts/charts'
  import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
  } from 'echarts/components'
  import VChart from 'vue-echarts'
  import { formatEventName } from '~/utils/statsFormatters'

  use([
    CanvasRenderer,
    LineChart,
    BarChart,
    FunnelChart,
    TooltipComponent,
    LegendComponent,
    GridComponent,
  ])

  const props = defineProps({
    statsData: {
      type: Object,
      required: true,
    },
  })

  // ─── Фильтр ──────────────────────────────────────────────────────────────

  const startDate = ref('')
  const endDate = ref('')
  const activePreset = ref('all')

  const PRESETS = [
    { key: 'today', label: 'Сегодня' },
    { key: '7d', label: '7 дней' },
    { key: '30d', label: '30 дней' },
    { key: 'all', label: 'Всё время' },
  ]

  function setPreset(key: string) {
    activePreset.value = key
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    if (key === 'today') {
      startDate.value = todayStr
      endDate.value = todayStr
    } else if (key === '7d') {
      const d = new Date(today)
      d.setDate(d.getDate() - 6)
      startDate.value = d.toISOString().split('T')[0]
      endDate.value = todayStr
    } else if (key === '30d') {
      const d = new Date(today)
      d.setDate(d.getDate() - 29)
      startDate.value = d.toISOString().split('T')[0]
      endDate.value = todayStr
    } else {
      startDate.value = ''
      endDate.value = ''
    }
  }

  function resetFilter() {
    startDate.value = ''
    endDate.value = ''
    activePreset.value = 'all'
  }

  function onDateChange() {
    activePreset.value = ''
  }

  const hasFilter = computed(() => !!(startDate.value || endDate.value))

  const filteredStatsData = computed(() => {
    if (!startDate.value && !endDate.value) return props.statsData

    const filtered: Record<string, Record<string, [number, number]>> = {}
    const start = startDate.value ? new Date(startDate.value) : null
    const end = endDate.value ? new Date(endDate.value) : null

    Object.entries(props.statsData).forEach(([date, events]) => {
      const d = new Date(date)
      if ((!start || d >= start) && (!end || d <= end)) {
        filtered[date] = events as Record<string, [number, number]>
      }
    })

    return filtered
  })

  // ─── Данные для линейного и столбчатого графиков ─────────────────────────

  const aggregatedData = computed(() => {
    const eventTypes = new Set<string>()
    const datasets: Record<string, Record<string, number>> = {}

    Object.entries(filteredStatsData.value).forEach(([date, events]) => {
      Object.entries(events as Record<string, [number, number]>).forEach(
        ([eventType, [, count]]) => {
          if (
            !eventType.startsWith('page_view') &&
            !eventType.startsWith('button_click')
          )
            return
          eventTypes.add(eventType)
          if (!datasets[eventType]) datasets[eventType] = {}
          datasets[eventType][date] = count
        },
      )
    })

    const labels = Object.keys(filteredStatsData.value).sort()
    const series = Array.from(eventTypes).map(eventType => ({
      eventType,
      name: formatEventName(eventType),
      data: labels.map(date => datasets[eventType]?.[date] || 0),
    }))

    return { labels, series }
  })

  // ─── Воронка покупки ──────────────────────────────────────────────────────

  const funnelData = computed(() => {
    const counts = {
      addToBasket: 0,
      startOrderButton: 0,
      completeOrderButton: 0,
      paymentSuccess: 0,
    }

    Object.values(filteredStatsData.value).forEach(events => {
      Object.entries(events as Record<string, [number, number]>).forEach(
        ([key, [, count]]) => {
          const name = key.replace('button_click_', '')
          if (name in counts) counts[name as keyof typeof counts] += count
        },
      )
    })

    return [
      { value: counts.addToBasket, name: 'Добавил в корзину' },
      { value: counts.startOrderButton, name: 'Начал оформление' },
      { value: counts.completeOrderButton, name: 'Отправил заказ' },
      { value: counts.paymentSuccess, name: 'Оплатил' },
    ]
  })

  const hasFunnelData = computed(() => funnelData.value[0].value > 0)

  // ─── Активность по дням недели ────────────────────────────────────────────

  const dayOfWeekData = computed(() => {
    const names = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    const counts = [0, 0, 0, 0, 0, 0, 0]

    Object.entries(filteredStatsData.value).forEach(([dateStr, events]) => {
      const dayIdx = (new Date(dateStr).getDay() + 6) % 7 // Пн=0
      const total = Object.values(
        events as Record<string, [number, number]>,
      ).reduce((sum, [, count]) => sum + count, 0)
      counts[dayIdx] += total
    })

    return { names, counts }
  })

  // ─── Адаптив ──────────────────────────────────────────────────────────────

  const isMobile = ref(false)

  function updateMobile() {
    isMobile.value = window.innerWidth < 640
  }

  onMounted(() => {
    updateMobile()
    window.addEventListener('resize', updateMobile)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateMobile)
  })

  // ─── Опции графиков ───────────────────────────────────────────────────────

  const sharedGrid = computed(() => ({
    left: isMobile.value ? '2%' : '3%',
    right: isMobile.value ? '2%' : '4%',
    bottom: isMobile.value ? '22%' : '15%',
    containLabel: true,
  }))

  const sharedXAxis = computed(() => ({
    type: 'category',
    data: aggregatedData.value.labels,
    axisLabel: {
      rotate: isMobile.value ? 45 : 0,
      fontSize: isMobile.value ? 10 : 12,
    },
  }))

  const sharedYAxis = computed(() => ({
    type: 'value',
    axisLabel: { fontSize: isMobile.value ? 10 : 12 },
  }))

  const sharedLegend = { type: 'scroll', bottom: 0, pageButtonItemGap: 4 }

  const lineChartOption = computed(() => ({
    tooltip: { trigger: 'axis', confine: true },
    legend: sharedLegend,
    grid: sharedGrid.value,
    xAxis: sharedXAxis.value,
    yAxis: sharedYAxis.value,
    series: aggregatedData.value.series
      .filter(s => s.eventType.startsWith('page_view'))
      .map(s => ({
        name: s.name,
        type: 'line',
        data: s.data,
        smooth: true,
        lineStyle: { width: 2 },
      })),
  }))

  const barChartOption = computed(() => ({
    tooltip: {
      trigger: 'axis',
      confine: true,
      axisPointer: { type: 'shadow' },
    },
    legend: sharedLegend,
    grid: sharedGrid.value,
    xAxis: sharedXAxis.value,
    yAxis: sharedYAxis.value,
    series: aggregatedData.value.series
      .filter(s => s.eventType.startsWith('button_click'))
      .map(s => ({
        name: s.name,
        type: 'bar',
        data: s.data,
        barMaxWidth: 40,
      })),
  }))

  const funnelChartOption = computed(() => ({
    tooltip: {
      trigger: 'item',
      formatter: (p: { name: string; value: number }) =>
        `${p.name}: <b>${p.value}</b>`,
    },
    series: [
      {
        type: 'funnel',
        left: isMobile.value ? '5%' : '15%',
        width: isMobile.value ? '90%' : '70%',
        top: 20,
        bottom: 20,
        sort: 'none',
        label: {
          show: true,
          position: 'inside',
          formatter: (p: { name: string; value: number }) =>
            `${p.name}\n${p.value}`,
          fontSize: isMobile.value ? 10 : 12,
        },
        data: funnelData.value,
        color: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'],
      },
    ],
  }))

  const dayOfWeekChartOption = computed(() => ({
    tooltip: {
      trigger: 'axis',
      confine: true,
      axisPointer: { type: 'shadow' },
      formatter: (params: { name: string; value: number }[]) =>
        `${params[0].name}: <b>${params[0].value}</b> событий`,
    },
    grid: { left: '3%', right: '4%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dayOfWeekData.value.names,
      axisLabel: { fontSize: isMobile.value ? 10 : 12 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: isMobile.value ? 10 : 12 },
    },
    series: [
      {
        type: 'bar',
        data: dayOfWeekData.value.counts.map((value, i) => ({
          value,
          itemStyle: { color: i >= 5 ? '#f59e0b' : '#3b82f6' },
        })),
        barMaxWidth: 60,
      },
    ],
  }))
</script>

<template>
  <div class="grid gap-6 sm:gap-8">
    <!-- Фильтр по периоду -->
    <div class="bg-white rounded-xl shadow-md p-4">
      <!-- Пресеты -->
      <div class="flex flex-wrap gap-2 mb-3">
        <button
          v-for="preset in PRESETS"
          :key="preset.key"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            activePreset === preset.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ]"
          @click="setPreset(preset.key)"
        >
          {{ preset.label }}
        </button>
      </div>
      <!-- Произвольный диапазон -->
      <div
        class="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4
          items-stretch sm:items-center"
      >
        <div class="flex items-center gap-2">
          <label
            for="start-date"
            class="text-sm text-gray-500 font-medium whitespace-nowrap"
          >
            С:
          </label>
          <input
            id="start-date"
            v-model="startDate"
            type="date"
            class="flex-1 sm:flex-none px-2 py-1.5 border border-gray-300
              rounded-md text-sm text-gray-700 bg-white cursor-pointer
              focus:outline-none focus:border-blue-500 focus:ring-2
              focus:ring-blue-100"
            @change="onDateChange"
          />
        </div>
        <div class="flex items-center gap-2">
          <label
            for="end-date"
            class="text-sm text-gray-500 font-medium whitespace-nowrap"
          >
            По:
          </label>
          <input
            id="end-date"
            v-model="endDate"
            type="date"
            class="flex-1 sm:flex-none px-2 py-1.5 border border-gray-300
              rounded-md text-sm text-gray-700 bg-white cursor-pointer
              focus:outline-none focus:border-blue-500 focus:ring-2
              focus:ring-blue-100"
            @change="onDateChange"
          />
        </div>
        <button
          v-if="hasFilter"
          type="button"
          class="w-full sm:w-auto px-4 py-1.5 bg-red-500 text-white
            rounded-md text-sm font-medium transition-colors hover:bg-red-600
            active:bg-red-700"
          @click="resetFilter"
        >
          Сбросить
        </button>
      </div>
    </div>

    <!-- Просмотры страниц -->
    <div
      class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col
        h-[280px] sm:h-[400px]"
    >
      <div class="px-4 pt-4 pb-1 flex-shrink-0">
        <h3 class="text-base font-semibold text-gray-700">
          Просмотры страниц
        </h3>
      </div>
      <div class="flex-1 min-h-0 px-2 pb-2">
        <VChart
          class="w-full h-full"
          :option="lineChartOption"
          autoresize
        />
      </div>
    </div>

    <!-- Клики по кнопкам -->
    <div
      class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col
        h-[280px] sm:h-[400px]"
    >
      <div class="px-4 pt-4 pb-1 flex-shrink-0">
        <h3 class="text-base font-semibold text-gray-700">
          Клики по кнопкам
        </h3>
      </div>
      <div class="flex-1 min-h-0 px-2 pb-2">
        <VChart
          class="w-full h-full"
          :option="barChartOption"
          autoresize
        />
      </div>
    </div>

    <!-- Воронка покупки -->
    <div
      v-if="hasFunnelData"
      class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col
        h-[280px] sm:h-[400px]"
    >
      <div class="px-4 pt-4 pb-1 flex-shrink-0">
        <h3 class="text-base font-semibold text-gray-700">Воронка покупки</h3>
        <p class="text-xs text-gray-400 mt-0.5">
          от добавления в корзину до оплаты
        </p>
      </div>
      <div class="flex-1 min-h-0 px-2 pb-2">
        <VChart
          class="w-full h-full"
          :option="funnelChartOption"
          autoresize
        />
      </div>
    </div>

    <!-- Активность по дням недели -->
    <div
      class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col
        h-[280px] sm:h-[400px]"
    >
      <div class="px-4 pt-4 pb-1 flex-shrink-0">
        <h3 class="text-base font-semibold text-gray-700">
          Активность по дням недели
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">
          <span class="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />
          будни &nbsp;
          <span class="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />
          выходные
        </p>
      </div>
      <div class="flex-1 min-h-0 px-2 pb-2">
        <VChart
          class="w-full h-full"
          :option="dayOfWeekChartOption"
          autoresize
        />
      </div>
    </div>
  </div>
</template>
