import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useExhibitionsStore } from '../exhibitions'
import type { Exhibition } from '~/types'

const mockExhibitionsData = ref<Exhibition[]>([])

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    exhibitions: mockExhibitionsData,
    loadExhibitions: vi.fn(async () => {}),
    publishExhibition: vi.fn(async () => {}),
  }),
}))

const baseExhibition: Exhibition = {
  id: 'ex_1',
  slug: 'tikhij-svet-zimy',
  tabTitle: 'Тихий свет зимы',
  title: 'Выставка «Тихий свет зимы»',
  shortDescription: 'Короткое описание',
  status: 'ongoing',
  dateRange: '10 января — 15 февраля 2025',
  dateStart: '2025-01-10',
  dateEnd: '2025-02-15',
  isFree: true,
  ticketInfo: 'Вход свободный',
  coverImage: 'https://example.com/cover.jpg',
  schedule: [
    { id: 'mon', label: 'Понедельник', time: '10:00–19:00' },
  ],
  location: {
    venue: 'Галерея «Север»',
    city: 'Москва',
    addressLine: 'ул. Тверская, 1',
    metro: ['Тверская'],
    mapLink: 'https://yandex.ru/maps/?text=...',
  },
  descriptionIntro: 'Intro',
  descriptionBody: 'Body',
  works: [
    { id: 1, title: 'Зимний лес' },
  ],
}

describe('useExhibitionsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockExhibitionsData.value = [
      baseExhibition,
      {
        ...baseExhibition,
        id: 'ex_2',
        slug: 'arktika',
        title: 'Арктика',
        status: 'planned',
      },
    ]
  })

  describe('getBySlug', () => {
    it('находит выставку по реальному slug из БД', () => {
      const store = useExhibitionsStore()

      const found = store.getBySlug('tikhij-svet-zimy').value
      expect(found).not.toBeNull()
      expect(found?.id).toBe('ex_1')
      expect(found?.title).toBe('Выставка «Тихий свет зимы»')
    })

    it('возвращает null для несуществующего slug', () => {
      const store = useExhibitionsStore()

      const missing = store.getBySlug('does-not-exist').value
      expect(missing).toBeNull()
    })

    it('не путает выставки при одинаковых id, но разных slug', () => {
      const store = useExhibitionsStore()

      const arctic = store.getBySlug('arktika').value
      expect(arctic?.id).toBe('ex_2')
      expect(arctic?.title).toBe('Арктика')
    })
  })

  describe('exhibitions computed', () => {
    it('возвращает массив из useApi', () => {
      const store = useExhibitionsStore()

      expect(store.exhibitions).toHaveLength(2)
      expect(store.exhibitions[0]?.slug).toBe('tikhij-svet-zimy')
    })
  })

  describe('getStatusLabel', () => {
    it('маппит планируемые/идущие/завершённые на русские ярлыки', () => {
      const store = useExhibitionsStore()

      expect(store.getStatusLabel('planned')).toBe('Запланирована')
      expect(store.getStatusLabel('ongoing')).toBe('Уже идёт')
      expect(store.getStatusLabel('finished')).toBe('Завершена')
    })
  })

  describe('isLoading', () => {
    it('true пока данных нет', () => {
      mockExhibitionsData.value = []
      const store = useExhibitionsStore()

      expect(store.isLoading).toBe(true)
    })

    it('false после загрузки', () => {
      const store = useExhibitionsStore()

      expect(store.isLoading).toBe(false)
    })
  })
})
