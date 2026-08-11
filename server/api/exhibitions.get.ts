import type { Exhibition } from '~/types'

const mockExhibitions: Exhibition[] = [
  {
    id: 1,
    slug: 'winter-2026',
    tabTitle: 'Зимняя выставка 2026',
    title: 'Зимняя выставка акварелей',
    shortDescription: 'Зимние пейзажи в технике акварели',
    status: 'planned',
    dateRange: '15 декабря 2026 — 31 января 2027',
    dateStart: '2026-12-15',
    dateEnd: '2027-01-31',
    isFree: true,
    ticketInfo: 'Вход свободный',
    coverImage: '/images/exhibitions/winter-cover.jpg',
    schedule: [
      { id: 'mon', label: 'Пн', time: '10:00 — 19:00' },
      { id: 'tue', label: 'Вт', time: '10:00 — 19:00' },
      { id: 'wed', label: 'Ср', time: '10:00 — 19:00' },
      { id: 'thu', label: 'Чт', time: '10:00 — 19:00' },
      { id: 'fri', label: 'Пт', time: '10:00 — 19:00' },
      { id: 'sat', label: 'Сб', time: '11:00 — 17:00' },
      { id: 'sun', label: 'Вс', time: 'Выходной', isClosed: true },
    ],
    location: {
      venue: 'Галерея "Акварель"',
      city: 'Москва',
      addressLine: 'ул. Тверская, д. 12',
      metro: ['Тверская', 'Пушкинская'],
      mapLink: 'https://yandex.ru/maps/',
    },
    descriptionIntro: 'Зимняя коллекция акварельных работ',
    descriptionBody: 'Подробное описание выставки и художника',
    works: [
      { id: 1, title: 'Первый снег', subtitle: '2025', image: '/images/works/snow-1.jpg' },
      { id: 2, title: 'Зимний лес', subtitle: '2025', image: '/images/works/forest.jpg' },
    ],
  },
]

export default defineEventHandler((): Exhibition[] => {
  try {
    return mockExhibitions
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Не удалось загрузить выставки' })
  }
})
