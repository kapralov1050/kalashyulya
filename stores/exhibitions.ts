import { defineStore } from 'pinia'
import type { Exhibition, ExhibitionStatus } from '~/types'
import { useFirebase } from '~/composables/firebase/useFirebase'
import {
  getDataByPath,
  setDataByPath,
} from '~/helpers/firebase/manageDatabase'

export const useExhibitionsStore = defineStore('exhibitions', () => {
  const { exhibitionsData } = useFirebase()

  const exhibitions = computed<Exhibition[]>(() => {
    if (!exhibitionsData.value) return []

    const raw = exhibitionsData.value as Record<string, Record<string, unknown>>

    return Object.values(raw).map((item: Record<string, unknown>) => {
      const status: ExhibitionStatus =
        item.status === 'planned' ||
        item.status === 'ongoing' ||
        item.status === 'finished'
          ? (item.status as ExhibitionStatus)
          : 'planned'

      return {
        id: item.id as number,
        slug: item.slug as string,
        title: item.title as string,
        shortDescription: (item.shortDescription as string) || (item.descriptionIntro as string) || '',
        status,
        dateRange: (item.dateRange as string) || '',
        coverImage: (item.coverImage as string) || '',
        schedule: (item.schedule as unknown[]) || [],
        location: {
          venue: (item.location as Record<string, unknown>)?.venue as string || '',
          city: (item.location as Record<string, unknown>)?.city as string || '',
          addressLine:
            (item.location as Record<string, unknown>)?.address as string || (item.location as Record<string, unknown>)?.addressLine as string || '',
          metro: (item.location as Record<string, unknown>)?.metro as string[] || [],
          mapLink: (item.location as Record<string, unknown>)?.mapLink as string || '',
        },
        descriptionIntro: (item.descriptionIntro as string) || '',
        descriptionBody: (item.descriptionBody as string) || '',
        works: (item.works as unknown[]) || [],
      } as Exhibition
    })
  })

  const getAll = computed(() => exhibitions.value)

  const getBySlug = (slug: string) =>
    computed(() => exhibitions.value.find(ex => ex.slug === slug) || null)

  const getStatusLabel = (status: ExhibitionStatus) => {
    switch (status) {
      case 'planned':
        return 'Запланирована'
      case 'ongoing':
        return 'Уже идёт'
      case 'finished':
        return 'Завершена'
      default:
        return ''
    }
  }

  const isLoading = computed(() => exhibitionsData.value === undefined)

  async function addNewExhibition(data: Record<string, unknown>) {
    const snapshot = await getDataByPath<Record<string, Record<string, unknown>>>('exhibitions')
    const ids = snapshot
      ? Object.values(snapshot).map(ex => Number(ex.id) || 0)
      : []
    const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1
    await setDataByPath({ ...data, id: nextId }, `exhibitions/exhibition_${nextId}`)
    return nextId
  }

  return {
    exhibitions,
    isLoading,
    getAll,
    getBySlug,
    getStatusLabel,
    addNewExhibition,
  }
})
