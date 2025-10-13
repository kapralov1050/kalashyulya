import { describe, it, expect } from 'vitest'

// Простой тест для проверки работы Vitest
describe('Basic Test Suite', () => {
  it('should pass basic math test', () => {
    expect(2 + 2).toBe(4)
  })

  it('should handle string operations', () => {
    const message = 'Hello, World!'
    expect(message).toContain('World')
    expect(message.length).toBeGreaterThan(0)
  })

  it('should handle array operations', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).toHaveLength(5)
    expect(numbers).toContain(3)
    expect(numbers.filter(n => n > 3)).toEqual([4, 5])
  })
})

// Тест для проверки работы с объектами
describe('Object Tests', () => {
  it('should handle object properties', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    }

    expect(user).toHaveProperty('name')
    expect(user.name).toBe('John Doe')
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  })
})
