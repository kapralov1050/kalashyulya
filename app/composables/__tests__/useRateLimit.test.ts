import type { useRateLimit as UseRateLimitFn } from '../useRateLimit'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type RL = ReturnType<typeof UseRateLimitFn>

async function loadUseRateLimit() {
  const mod = await import('../useRateLimit')
  return mod.useRateLimit
}

const FIFTEEN_MIN = 15 * 60 * 1000

function mountRateLimit(
  useRateLimit: typeof UseRateLimitFn,
  opts: { key: string; maxAttempts?: number; windowMs?: number },
): { wrapper: ReturnType<typeof mount>; rl: RL } {
  let rlRef!: RL
  const TestComp = defineComponent({
    setup() {
      rlRef = useRateLimit({
        key: opts.key,
        maxAttempts: opts.maxAttempts ?? 5,
        windowMs: opts.windowMs ?? FIFTEEN_MIN,
      })
      return { rl: rlRef }
    },
    render() {
      return h('div')
    },
  })
  const wrapper = mount(TestComp)
  return { wrapper, rl: rlRef }
}

describe('useRateLimit', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('singleton', () => {
    it('returns the same instance for the same key', async () => {
      const useRateLimit = await loadUseRateLimit()
      const a = mountRateLimit(useRateLimit, { key: 'shared' })
      const b = mountRateLimit(useRateLimit, { key: 'shared' })

      expect(a.rl).toBe(b.rl)
    })

    it('uses different counters for different keys', async () => {
      const useRateLimit = await loadUseRateLimit()
      const a = mountRateLimit(useRateLimit, { key: 'key-a' })
      const b = mountRateLimit(useRateLimit, { key: 'key-b' })

      a.rl.recordAttempt()
      a.rl.recordAttempt()
      b.rl.recordAttempt()

      expect(a.rl.attempts.value).toBe(2)
      expect(b.rl.attempts.value).toBe(1)
    })
  })

  describe('recordAttempt', () => {
    it('increments attempts from zero', async () => {
      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, { key: 'inc' })

      expect(rl.attempts.value).toBe(0)
      rl.recordAttempt()
      expect(rl.attempts.value).toBe(1)
      rl.recordAttempt()
      expect(rl.attempts.value).toBe(2)
    })
  })

  describe('block', () => {
    it('blocks after exceeding maxAttempts', async () => {
      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, { key: 'block', maxAttempts: 3 })

      rl.recordAttempt()
      rl.recordAttempt()
      rl.recordAttempt()
      expect(rl.isBlocked.value).toBe(false)
      expect(rl.attempts.value).toBe(3)

      rl.recordAttempt()
      expect(rl.isBlocked.value).toBe(true)
      expect(rl.blockedUntil.value).not.toBeNull()
    })

    it('does not extend blockedUntil when called during block', async () => {
      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, {
        key: 'no-extend',
        maxAttempts: 2,
        windowMs: FIFTEEN_MIN,
      })

      rl.recordAttempt()
      rl.recordAttempt()
      rl.recordAttempt()
      const blockedBefore = rl.blockedUntil.value
      expect(rl.isBlocked.value).toBe(true)

      vi.advanceTimersByTime(14 * 60 * 1000)

      rl.recordAttempt()
      expect(rl.blockedUntil.value).toBe(blockedBefore)
    })

    it('does not increment attempts when called during block', async () => {
      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, { key: 'no-inc', maxAttempts: 2 })

      rl.recordAttempt()
      rl.recordAttempt()
      rl.recordAttempt()
      const attemptsBefore = rl.attempts.value
      expect(attemptsBefore).toBe(2)

      vi.advanceTimersByTime(60 * 1000)
      rl.recordAttempt()
      expect(rl.attempts.value).toBe(attemptsBefore)
    })

    it('clears state after blockedUntil expires', async () => {
      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, {
        key: 'expire',
        maxAttempts: 1,
        windowMs: 5000,
      })

      rl.recordAttempt()
      rl.recordAttempt()
      expect(rl.isBlocked.value).toBe(true)

      vi.advanceTimersByTime(6000)

      expect(rl.isBlocked.value).toBe(false)
      expect(rl.attempts.value).toBe(0)
      expect(rl.blockedUntil.value).toBeNull()
    })

    it('starts fresh after reset', async () => {
      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, { key: 'reset', maxAttempts: 3 })

      rl.recordAttempt()
      rl.recordAttempt()
      rl.reset()
      rl.recordAttempt()

      expect(rl.attempts.value).toBe(1)
      expect(rl.isBlocked.value).toBe(false)
    })

    it('reset clears blocked state and attempts', async () => {
      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, { key: 'reset-block', maxAttempts: 2 })

      rl.recordAttempt()
      rl.recordAttempt()
      rl.recordAttempt()
      expect(rl.isBlocked.value).toBe(true)

      rl.reset()

      expect(rl.isBlocked.value).toBe(false)
      expect(rl.attempts.value).toBe(0)
      expect(rl.blockedUntil.value).toBeNull()
    })
  })

  describe('window', () => {
    it('starts a new window after windowMs since first attempt', async () => {
      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, {
        key: 'window',
        maxAttempts: 5,
        windowMs: FIFTEEN_MIN,
      })

      rl.recordAttempt()
      rl.recordAttempt()
      expect(rl.attempts.value).toBe(2)

      vi.advanceTimersByTime(16 * 60 * 1000)

      rl.recordAttempt()
      expect(rl.attempts.value).toBe(1)
    })
  })

  describe('remainingTimeMs', () => {
    it('returns windowMs when freshly blocked', async () => {
      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, {
        key: 'rem-1',
        maxAttempts: 1,
        windowMs: 10000,
      })

      rl.recordAttempt()
      rl.recordAttempt()

      expect(rl.remainingTimeMs.value).toBe(10000)
    })

    it('decreases as time passes', async () => {
      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, {
        key: 'rem-2',
        maxAttempts: 1,
        windowMs: 10000,
      })

      rl.recordAttempt()
      rl.recordAttempt()

      vi.advanceTimersByTime(3000)

      expect(rl.remainingTimeMs.value).toBe(7000)
    })

    it('is zero when not blocked', async () => {
      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, { key: 'rem-3', maxAttempts: 5 })

      expect(rl.remainingTimeMs.value).toBe(0)

      rl.recordAttempt()
      expect(rl.remainingTimeMs.value).toBe(0)
    })
  })

  describe('persist', () => {
    it('writes state to localStorage after recordAttempt', async () => {
      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, { key: 'persist' })

      rl.recordAttempt()
      rl.recordAttempt()

      const stored = JSON.parse(localStorage.getItem('ratelimit:persist')!)
      expect(stored.attempts).toBe(2)
      expect(typeof stored.firstAttemptAt).toBe('number')
    })

    it('writes blockedUntil to localStorage when blocked', async () => {
      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, {
        key: 'persist-block',
        maxAttempts: 1,
        windowMs: FIFTEEN_MIN,
      })

      rl.recordAttempt()
      rl.recordAttempt()

      const stored = JSON.parse(localStorage.getItem('ratelimit:persist-block')!)
      expect(stored.blockedUntil).not.toBeNull()
    })

    it('restores attempts from localStorage on mount', async () => {
      const now = Date.now()
      localStorage.setItem(
        'ratelimit:restore',
        JSON.stringify({
          attempts: 2,
          firstAttemptAt: now - 1000,
          blockedUntil: null,
        }),
      )

      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, { key: 'restore', maxAttempts: 5 })

      expect(rl.attempts.value).toBe(2)
    })

    it('restores blocked state from localStorage on mount', async () => {
      const now = Date.now()
      localStorage.setItem(
        'ratelimit:restore-blocked',
        JSON.stringify({
          attempts: 5,
          firstAttemptAt: now - 1000,
          blockedUntil: now + FIFTEEN_MIN,
        }),
      )

      const useRateLimit = await loadUseRateLimit()
      const { rl } = mountRateLimit(useRateLimit, {
        key: 'restore-blocked',
        maxAttempts: 5,
      })

      expect(rl.isBlocked.value).toBe(true)
    })
  })
})