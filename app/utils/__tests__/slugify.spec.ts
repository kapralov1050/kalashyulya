import { describe, it, expect } from 'vitest'
import { slugify } from '../slugify'

describe('slugify', () => {
  it('should convert spaces to hyphens and lowercase text', () => {
    const result = slugify('Hello World Test')
    expect(result).toBe('hello-world-test')
  })

  it('should handle empty string', () => {
    const result = slugify('')
    expect(result).toBe('')
  })

  it('should handle single word', () => {
    const result = slugify('Test')
    expect(result).toBe('test')
  })
})
