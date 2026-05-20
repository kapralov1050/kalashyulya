import { describe, it, expect } from 'vitest'
import { pluralize, pluralizeViews } from '../pluralize'

describe('pluralize', () => {
  it('should return singular form for 1', () => {
    const result = pluralize(1, 'products')
    expect(result).toBe('1 товар')
  })

  it('should return plural form for 2-4', () => {
    const result = pluralize(2, 'products')
    expect(result).toBe('2 товара')
  })

  it('should return many form for 5+', () => {
    const result = pluralize(5, 'products')
    expect(result).toBe('5 товаров')
  })

  it('should handle 11 (exception case)', () => {
    const result = pluralize(11, 'products')
    expect(result).toBe('11 товаров')
  })

  it('should handle 21 (ends with 1 but not 11)', () => {
    const result = pluralize(21, 'products')
    expect(result).toBe('21 товар')
  })
})

describe('pluralizeViews', () => {
  it('should work with views word', () => {
    const result = pluralizeViews(3)
    expect(result).toBe('3 просмотра')
  })

  it('should handle many views', () => {
    const result = pluralizeViews(10)
    expect(result).toBe('10 просмотров')
  })
})
