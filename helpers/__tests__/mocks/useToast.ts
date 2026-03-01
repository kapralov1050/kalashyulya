import { vi } from 'vitest'

export const useToastMock = {
  add: vi.fn(),
}

export const useToast = () => useToastMock
