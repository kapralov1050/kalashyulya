import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  setupScrollAnimation,
  cleanupScrollAnimation,
} from '../scrollAnimation'

vi.mock('gsap', () => ({
  gsap: {
    set: vi.fn(),
    to: vi.fn(),
    registerPlugin: vi.fn(),
  },
  default: {
    set: vi.fn(),
    to: vi.fn(),
    registerPlugin: vi.fn(),
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    getAll: vi.fn(() => []),
  },
  default: {
    getAll: vi.fn(() => []),
  },
}))

vi.mock('gsap/MotionPathPlugin', () => ({
  MotionPathPlugin: {},
}))

describe('setupScrollAnimation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return cleanup function when path element exists', () => {
    // Mock DOM elements
    const mockPath = {
      getAttribute: vi.fn(),
      getTotalLength: vi.fn(() => 100),
    }

    document.querySelector = vi.fn(() => mockPath as any)

    const result = setupScrollAnimation('.test-path')

    expect(result).toBeDefined()
    expect(result?.cleanup).toBeInstanceOf(Function)
  })

  it('should return null when path element does not exist', () => {
    document.querySelector = vi.fn(() => null)

    const result = setupScrollAnimation('.non-existent-path')

    expect(result).toBeUndefined()
  })
})

describe('cleanupScrollAnimation', () => {
  it('should not throw when path element does not exist', () => {
    document.querySelector = vi.fn(() => null)

    expect(() => cleanupScrollAnimation('.non-existent-path')).not.toThrow()
  })
})
