import { describe, it, expect } from 'vitest'
import { toSentenceCase } from '../sentenceCase'

describe('toSentenceCase', () => {
  it('переводит капс в обычный регистр', () => {
    expect(toSentenceCase('ОБО МНЕ')).toBe('Обо мне')
  })

  it('сохраняет цифры', () => {
    expect(toSentenceCase('КАЛЕНДАРИ 2026')).toBe('Календари 2026')
  })

  it('не меняет уже нормальный текст', () => {
    expect(toSentenceCase('Магазин')).toBe('Магазин')
  })

  it('возвращает пустую строку, пока локали не загружены', () => {
    expect(toSentenceCase('')).toBe('')
  })
})
