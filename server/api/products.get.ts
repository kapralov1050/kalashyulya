import type { Product } from '~/types'

const mockProducts: Product[] = [
  {
    id: 1,
    title: 'Акварель "Море"',
    description: 'Спокойное море на закате',
    size: '30x40',
    material: 'paper',
    tecnic: 'watercolor',
    year: '2024',
    categoryId: 'paintings',
    image: ['/images/sea-1.jpg'],
    file: [],
    price: 5000,
    stock: 3,
    tags: ['море', 'закат'],
  },
  {
    id: 2,
    title: 'Открытка "Зима"',
    description: 'Зимний пейзаж',
    size: '10x15',
    material: 'cardboard',
    tecnic: 'watercolor',
    year: '2025',
    categoryId: 'cards',
    image: ['/images/winter-card.jpg'],
    file: [],
    price: 350,
    stock: 20,
    tags: ['зима', 'открытка'],
  },
  {
    id: 3,
    title: 'Акварель "Горы"',
    description: 'Горный пейзаж',
    size: '40x50',
    material: 'paper',
    tecnic: 'watercolor',
    year: '2025',
    categoryId: 'paintings',
    image: ['/images/mountains.jpg'],
    file: [],
    price: 7500,
    stock: 0,
    tags: ['горы', 'пейзаж'],
    isReserved: true,
  },
]

export default defineEventHandler((): Product[] => {
  try {
    return mockProducts
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Не удалось загрузить товары' })
  }
})
