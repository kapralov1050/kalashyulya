import { defineStore } from 'pinia'
import type { Exhibition, ExhibitionStatus } from '~/types'
import { useApi } from '~/composables/useApi'

export const useExhibitionsStore = defineStore('exhibitions', () => {
  const api = useApi()

  const exhibitions = computed<Exhibition[]>(() => api.exhibitions.value)
  const getAll = computed(() => exhibitions.value)
  const getBySlug = (slug: string) =>
    computed(() => exhibitions.value.find(ex => ex.slug === slug) || null)
  const isLoading = computed(() => !api.isExhibitionsLoaded.value)
  const loadError = computed(() => api.isExhibitionsFailed.value)

  const getStatusLabel = (status: ExhibitionStatus) => {
    switch (status) {
      case 'planned': return 'Запланирована'
      case 'ongoing': return 'Уже идёт'
      case 'finished': return 'Завершена'
      default: return ''
    }
  }

  async function loadExhibitions() {
    await api.loadExhibitions()
  }

  async function publishExhibition(id: string) {
    await api.publishExhibition(id)
    await api.loadExhibitions()
  }

  return {
    exhibitions,
    isLoading,
    loadError,
    getAll,
    getBySlug,
    getStatusLabel,
    loadExhibitions,
    publishExhibition,
  }
})