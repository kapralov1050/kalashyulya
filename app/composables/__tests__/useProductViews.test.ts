import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'

const mocks = vi.hoisted(() => ({
  mockTrackProductView: vi.fn(),
  mockIsDevOrPreview: vi.fn(),
}))

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    trackProductView: mocks.mockTrackProductView,
  }),
}))

vi.mock('~/utils/devGuard', () => ({
  isDevOrPreview: mocks.mockIsDevOrPreview,
}))

import { useProductViews } from '../useProductViews'

describe('useProductViews (dev guard)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    sessionStorage.clear()
    mocks.mockTrackProductView.mockClear()
    mocks.mockIsDevOrPreview.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('НЕ инкрементит views в dev/preview (isDevOrPreview=true)', async () => {
    mocks.mockIsDevOrPreview.mockReturnValue(true)
    const { trackView } = useProductViews('product_101')
    await trackView()
    expect(mocks.mockTrackProductView).not.toHaveBeenCalled()
  })

  it('инкрементит views только на prod (isDevOrPreview=false)', async () => {
    mocks.mockIsDevOrPreview.mockReturnValue(false)
    vi.stubGlobal('useApi', () => ({
      trackProductView: mocks.mockTrackProductView.mockResolvedValue(undefined),
    }))
    const { trackView } = useProductViews('product_101')
    await trackView()
    expect(mocks.mockTrackProductView).toHaveBeenCalledWith('product_101')
    await trackView()
    expect(mocks.mockTrackProductView).toHaveBeenCalledTimes(1)
  })

  it('не вызывается если productId пустой', async () => {
    mocks.mockIsDevOrPreview.mockReturnValue(false)
    vi.stubGlobal('useApi', () => ({
      trackProductView: mocks.mockTrackProductView.mockResolvedValue(undefined),
    }))
    const { trackView } = useProductViews('')
    await trackView()
    expect(mocks.mockTrackProductView).not.toHaveBeenCalled()
  })
})