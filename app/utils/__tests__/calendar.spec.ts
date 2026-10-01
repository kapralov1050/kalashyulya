import { describe, expect, it } from 'vitest'
import { calendarAnchorId } from '../calendar'

describe('calendarAnchorId', () => {
  it('строит якорь секции из id', () => {
    expect(calendarAnchorId({ id: 'product_57' })).toBe('calendar-product_57')
  })

  it('принимает числовой id', () => {
    expect(calendarAnchorId({ id: 12 })).toBe('calendar-12')
  })
})
