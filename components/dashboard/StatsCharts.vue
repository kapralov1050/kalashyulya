<script setup lang="ts">
  import { Chart, registerables } from 'chart.js'
  import autocolors from 'chartjs-plugin-autocolors'
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

  Chart.register(...registerables, autocolors)

  const props = defineProps({
    statsData: {
      type: Object,
      required: true,
    },
  })

  const lineChartRef = ref<HTMLCanvasElement | null>(null)
  const barChartRef = ref<HTMLCanvasElement | null>(null)
  let lineChart: Chart | null = null
  let barChart: Chart | null = null

  const aggregatedData = computed(() => {
    const eventTypes = new Set<string>()
    const datasets: Record<string, Record<string, number>> = {}

    // Маппинг для красивых названий событий
    const nameMap: Record<string, string> = {
      calendar: 'Переходов на страницу календарей',
      shop: 'Переходов в магазин',
      productExtendedButton: 'Открывал карточку товара',
      startOrderButton: 'Начинал оформление заказа',
      completeOrderButton: 'Закончил оформление заказа',
      vkButton: 'Переходы во Вконтакте',
      telegramButton: 'Переходы в Телеграм',
    }

    // Функция форматирования названий событий
    const formatEventName = (eventType: string) => {
      const [entity, action, ...nameParts] = eventType.split('_')
      const name = nameParts.join('_')
      return (
        nameMap[name] ||
        eventType
          .replace('page_view_', 'Просмотр: ')
          .replace('button_click_', 'Клик: ')
          .replace(/_/g, ' ')
      )
    }

    // Собираем все уникальные типы событий и данные по датам
    Object.entries(props.statsData).forEach(([date, events]) => {
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

    // Преобразуем в формат для Chart.js
    const labels = Object.keys(props.statsData)
    const chartDatasets = Array.from(eventTypes).map(eventType => {
      return {
        label: formatEventName(eventType),
        data: labels.map(date => datasets[eventType][date] || 0),
      }
    })

    return {
      labels,
      datasets: chartDatasets,
    }
  })

  onMounted(() => {
    initCharts()
  })

  onUnmounted(() => {
    lineChart?.destroy()
    barChart?.destroy()
  })

  watch(aggregatedData, () => {
    updateCharts()
  })

  const initCharts = () => {
    if (!lineChartRef.value || !barChartRef.value) return

    lineChart = new Chart(lineChartRef.value, {
      type: 'line',
      data: {
        labels: aggregatedData.value.labels,
        datasets: aggregatedData.value.datasets.map(dataset => ({
          ...dataset,
          borderWidth: 2,
          tension: 0.4,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          autocolors: { mode: 'data' },
          legend: {
            position: 'bottom',
          },
        },
      },
    })

    barChart = new Chart(barChartRef.value, {
      type: 'bar',
      data: {
        labels: aggregatedData.value.labels,
        datasets: aggregatedData.value.datasets.map(dataset => ({
          ...dataset,
          borderWidth: 1,
          hidden: dataset.label.startsWith('Просмотр: '),
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          autocolors: { mode: 'data' },
          legend: {
            position: 'bottom',
          },
        },
      },
    })
  }

  const updateCharts = () => {
    if (!lineChart || !barChart) return

    lineChart.data.labels = aggregatedData.value.labels
    lineChart.data.datasets = aggregatedData.value.datasets.map(dataset => ({
      ...dataset,
      borderWidth: 2,
      tension: 0.4,
      hidden: dataset.label.startsWith('Клик: '),
    }))
    lineChart.update()

    barChart.data.labels = aggregatedData.value.labels
    barChart.data.datasets = aggregatedData.value.datasets.map(dataset => ({
      ...dataset,
      borderWidth: 1,
      hidden: dataset.label.startsWith('Просмотр: '),
    }))
    barChart.update()
  }
</script>

<template>
  <div class="stats-charts">
    <div class="chart-container">
      <h3>Статистика просмотров страниц</h3>
      <canvas ref="lineChartRef"></canvas>
    </div>
    <div class="chart-container">
      <h3>Статистика кликов по кнопкам</h3>
      <canvas ref="barChartRef"></canvas>
    </div>
  </div>
</template>

<style scoped>
  .stats-charts {
    display: grid;
    gap: 2rem;
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
