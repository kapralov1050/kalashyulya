import { describe, it, expect, vi } from 'vitest'
import { formatEventName, formatDate, formatLastUpdated, getMonthName } from '../statsFormatters'

describe('formatEventName', () => {
  it('should format known event names from map', () => {
    const result = formatEventName('page_view_calendar')
    expect(result).toBe('Переходов на страницу календарей')
  })

  it('should format unknown page_view events', () => {
    const result = formatEventName('page_view_custom_page')
    expect(result).toBe('Просмотр: custom page')
  })

  it('should format unknown button_click events', () => {
    const result = formatEventName('button_click_test_button')
    expect(result).toBe('Клик: test button')
  })
})

describe('formatDate', () => {
  it('should format date string to Russian locale', () => {
    const result = formatDate('2025-03-01')
    expect(result).toContain('2025')
    expect(result).toContain('марта')
    expect(result).toContain('1')
  })
})

describe('formatLastUpdated', () => {
  it('should format timestamp to time string', () => {
    const timestamp = '2025-03-01T14:30:00Z'
    const result = formatLastUpdated(timestamp)
    expect(result).toContain('обновлено:')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })
})

describe('getMonthName', () => {
  it('should return month name for valid number', () => {
    const result = getMonthName('3')
    expect(result).toBe('Март')
  })

  it('should return month name for January', () => {
    const result = getMonthName('1')
    expect(result).toBe('Январь')
  })

  it('should return December', () => {
    const result = getMonthName('12')
    expect(result).toBe('Декабрь')
  })

  it('should handle invalid month number', () => {
    const result = getMonthName('15')
    expect(result).toBe('15')
  })
})
