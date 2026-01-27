import { defineStore } from 'pinia'
import type { Exhibition, ExhibitionStatus } from '~/types'
import { useFirebase } from '~/composables/firebase/useFirebase'

export const useExhibitionsStore = defineStore('exhibitions', () => {
  const { exhibitionsData } = useFirebase()

  const exhibitions = computed<Exhibition[]>(() => {
    if (!exhibitionsData.value) return []

    const raw = exhibitionsData.value

    return Object.values(raw).map((item: any) => {
      const status: ExhibitionStatus =
        item.status === 'planned' ||
        item.status === 'ongoing' ||
        item.status === 'finished'
          ? item.status
          : 'planned'

      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        shortDescription: item.shortDescription || item.descriptionIntro || '',
        status,
        dateRange: item.dateRange || '',
        coverImage: item.coverImage || '',
        schedule: item.schedule || [],
        location: {
          venue: item.location?.venue || '',
          city: item.location?.city || '',
          addressLine:
            item.location?.address || item.location?.addressLine || '',
          metro: item.location?.metro || [],
          mapLink: item.location?.mapLink || '',
        },
        descriptionIntro: item.descriptionIntro || '',
        descriptionBody: item.descriptionBody || '',
        works: item.works || [],
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

  return {
    exhibitions,
    getAll,
    getBySlug,
    getStatusLabel,
  }
})
