import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { showToast } from '../showToast'

// Mock the useToast composable from @nuxt/ui
const mockAdd = vi.fn()

// Stub useToast globally since it's auto-imported by Nuxt
beforeEach(() => {
  vi.stubGlobal('useToast', () => ({
    add: mockAdd,
  }))
})

// Clean up global stubs to prevent pollution
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('showToast', () => {
  beforeEach(() => {
    mockAdd.mockClear()
  })

  it('should call toast.add with correct parameters', () => {
    showToast('Test Title', 'Test Description', 'test-icon')

    expect(mockAdd).toHaveBeenCalledTimes(1)
    expect(mockAdd).toHaveBeenCalledWith({
      title: 'Test Title',
      description: 'Test Description',
      icon: 'test-icon',
    })
  })

  it('should handle empty parameters', () => {
    showToast('', '', '')

    expect(mockAdd).toHaveBeenCalledTimes(1)
    expect(mockAdd).toHaveBeenCalledWith({
      title: '',
      description: '',
      icon: '',
    })
  })
})
