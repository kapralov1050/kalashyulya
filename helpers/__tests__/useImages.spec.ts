import { describe, it, expect, vi } from 'vitest'
import { awaitImage } from '../useImages'

describe('awaitImage', () => {
  it('should return loadImages function', () => {
    const { loadImages } = awaitImage()
    expect(typeof loadImages).toBe('function')
  })

  it('should handle empty image array', async () => {
    const { loadImages } = awaitImage()

    await expect(loadImages([])).resolves.toBeUndefined()
  })
})
