import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'

const mockTrackProductView = vi.fn()

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    trackProductView: mockTrackProductView,
  }),
}))

const mockIsDevOrPreview = vi.fn()
vi.mock('~/utils/devGuard', () => ({
  isDevOrPreview: mockIsDevOrPreview,
}))

import { useProductViews } from '../useProductViews'

describe('useProductViews (dev guard)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    sessionStorage.clear()
    mockTrackProductView.mockClear()
    mockIsDevOrPreview.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('НЕ инкрементит views в dev/preview (isDevOrPreview=true)', async () => {
    mockIsDevOrPreview.mockReturnValue(true)
    const { trackView } = useProductViews('product_101')
    await trackView()
    expect(mockTrackProductView).not.toHaveBeenCalled()
  })

  it('инкрементит views только на prod (isDevOrPreview=false)', async () => {
    mockIsDevOrPreview.mockReturnValue(false)
    vi.stubGlobal('useApi', () => ({
      trackProductView: mockTrackProductView.mockResolvedValue(undefined),
    }))
    const { trackView } = useProductViews('product_101')
    await trackView()
    expect(mockTrackProductView).toHaveBeenCalledWith('product_101')
    // sessionStorage помечен, второй вызов не пойдёт
    await trackView()
    expect(mockTrackProductView).toHaveBeenCalledTimes(1)
  })

  it('не вызывается если productId пустой', async () => {
    mockIsDevOrPreview.mockReturnValue(false)
    vi.stubGlobal('useApi', () => ({
      trackProductView: mockTrackProductView.mockResolvedValue(undefined),
    }))
    const { trackView } = useProductViews('')
    await trackView()
    expect(mockTrackProductView).not.toHaveBeenCalled()
  })
})