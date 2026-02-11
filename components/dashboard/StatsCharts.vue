<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import { LineChart, BarChart } from 'echarts/charts'
  import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
  } from 'echarts/components'
  import VChart from 'vue-echarts'
  import { formatEventName } from '~/utils/statsFormatters'

  // Регистрируем только нужные компоненты для tree-shaking
  use([
    CanvasRenderer,
    LineChart,
    BarChart,
    TitleComponent,
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

  // Фильтр по периоду
  const startDate = ref<string>('')
  const endDate = ref<string>('')

  // Фильтрация данных по выбранному периоду
  const filteredStatsData = computed(() => {
    if (!startDate.value && !endDate.value) {
      return props.statsData
    }

    const filtered: Record<string, Record<string, [number, number]>> = {}
    const start = startDate.value ? new Date(startDate.value) : null
    const end = endDate.value ? new Date(endDate.value) : null

    Object.entries(props.statsData).forEach(([date, events]) => {
      const currentDate = new Date(date)
      const afterStart = !start || currentDate >= start
      const beforeEnd = !end || currentDate <= end

      if (afterStart && beforeEnd) {
        filtered[date] = events
      }
    })

    return filtered
  })

  // Сброс фильтра
  const resetFilter = () => {
    startDate.value = ''
    endDate.value = ''
  }

  // Проверка, установлен ли фильтр
  const hasFilter = computed(() => !!(startDate.value || endDate.value))

  const aggregatedData = computed(() => {
    const eventTypes = new Set<string>()
    const datasets: Record<string, Record<string, number>> = {}

    // Собираем все уникальные типы событий и данные по датам
    Object.entries(filteredStatsData.value).forEach(([date, events]) => {
      Object.entries(events as Record<string, [number, number]>).forEach(
        ([eventType, [_, count]]) => {
          eventTypes.add(eventType)
          if (!datasets[eventType]) {
            datasets[eventType] = {}
          }
          datasets[eventType][date] = count
        },
      )
    })

    // Преобразуем в формат для ECharts
    const labels = Object.keys(filteredStatsData.value)
    const series = Array.from(eventTypes).map(eventType => ({
      eventType, // Сохраняем исходный тип события для фильтрации
      name: formatEventName(eventType),
      data: labels.map(date => datasets[eventType][date] || 0),
    }))

    return {
      labels,
      series,
    }
  })

  // Опции для линейного графика (просмотры страниц)
  const lineChartOption = computed(() => ({
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: aggregatedData.value.labels,
    },
    yAxis: {
      type: 'value',
    },
    series: aggregatedData.value.series
      .filter(s => s.eventType.startsWith('page_view'))
      .map(s => ({
        name: s.name,
        type: 'line',
        data: s.data,
        smooth: true,
        lineStyle: {
          width: 2,
        },
      })),
  }))

  // Опции для столбчатого графика (клики по кнопкам)
  const barChartOption = computed(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: aggregatedData.value.labels,
    },
    yAxis: {
      type: 'value',
    },
    series: aggregatedData.value.series
      .filter(s => s.eventType.startsWith('button_click'))
      .map(s => ({
        name: s.name,
        type: 'bar',
        data: s.data,
        barWidth: '60%',
      })),
  }))
</script>

<template>
  <div class="stats-charts">
    <!-- Фильтр по периоду -->
    <div class="filter-panel">
      <div class="filter-controls">
        <div class="filter-field">
          <label for="start-date">С:</label>
          <input
            id="start-date"
            v-model="startDate"
            type="date"
            class="date-input"
          />
        </div>
        <div class="filter-field">
          <label for="end-date">По:</label>
          <input
            id="end-date"
            v-model="endDate"
            type="date"
            class="date-input"
          />
        </div>
        <button
          v-if="hasFilter"
          type="button"
          class="reset-button"
          @click="resetFilter"
        >
          Сбросить
        </button>
      </div>
    </div>

    <div class="chart-container">
      <h3>Статистика просмотров страниц</h3>
      <VChart :option="lineChartOption" autoresize />
    </div>
    <div class="chart-container">
      <h3>Статистика кликов по кнопкам</h3>
      <VChart :option="barChartOption" autoresize />
    </div>
  </div>
</template>

<style scoped>
  .stats-charts {
    display: grid;
    gap: 2rem;
  }

  .filter-panel {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1rem;
  }

  .filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .filter-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-field label {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }

  .date-input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.9rem;
    color: #333;
    background: white;
    cursor: pointer;
  }

  .date-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .reset-button {
    padding: 0.5rem 1rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .reset-button:hover {
    background: #dc2626;
  }

  .reset-button:active {
    background: #b91c1c;
  }

  .chart-container {
    position: relative;
    height: 400px;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .chart-container h3 {
    margin-bottom: 1rem;
    font-size: 1.2rem;
    color: #333;
  }
</style>
