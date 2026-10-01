import { describe, expect, it } from 'vitest'
import type { Product } from '~/types'
import { selectFeaturedWorks } from '../featuredWorks'

const product = (overrides: Partial<Product>): Product => ({
  id: 'product_1',
  title: 'Работа',
  description: '',
  size: '',
  material: '',
  tecnic: '',
  year: '',
  categoryId: 'category_1',
  image: [],
  file: [],
  price: 1000,
  stock: 1,
  tags: [],
  isReserved: false,
  createdAt: 1,
  ...overrides,
})

describe('selectFeaturedWorks', () => {
  it('берёт только картины в продаже', () => {
    const result = selectFeaturedWorks([
      product({ id: 'product_1' }),
      product({ id: 'product_2', categoryId: 'category_3' }),
      product({ id: 'product_3', stock: 0, isReserved: true }),
      product({ id: 'product_4', isReserved: true }),
    ])

    expect(result.map(p => p.id)).toEqual(['product_1'])
  })

  it('сортирует от новых к старым', () => {
    const result = selectFeaturedWorks([
      product({ id: 'product_1', createdAt: 100 }),
      product({ id: 'product_2', createdAt: 300 }),
      product({ id: 'product_3', createdAt: 200 }),
    ])

    expect(result.map(p => p.id)).toEqual(['product_2', 'product_3', 'product_1'])
  })

  it('при одинаковой дате ставит выше товар с большим номером', () => {
    const result = selectFeaturedWorks([
      product({ id: 'product_27', createdAt: 5 }),
      product({ id: 'product_105', createdAt: 5 }),
    ])

    expect(result.map(p => p.id)).toEqual(['product_105', 'product_27'])
  })

  it('возвращает не больше заданного количества', () => {
    const products = Array.from({ length: 10 }, (_, i) =>
      product({ id: `product_${i}`, createdAt: i }),
    )

    expect(selectFeaturedWorks(products)).toHaveLength(6)
    expect(selectFeaturedWorks(products, 3)).toHaveLength(3)
  })
})
