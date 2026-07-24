import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
} from '../useCookieConsent'

async function loadCookieConsent() {
  const mod = await import('../useCookieConsent')
  return mod.useCookieConsent
}

describe('useCookieConsent', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  describe('singleton', () => {
    it('returns the same state on repeated calls', async () => {
      const useCookieConsent = await loadCookieConsent()
      const first = useCookieConsent()
      const second = useCookieConsent()

      expect(second.cookieConsent).toBe(first.cookieConsent)
    })

    it('shares mutations between callers', async () => {
      const useCookieConsent = await loadCookieConsent()
      const first = useCookieConsent()
      first.acceptAll()
      await nextTick()
      const second = useCookieConsent()

      expect(second.cookieConsent).toBe(first.cookieConsent)
      expect(second.cookieConsent.analytics).toBe(true)
      expect(second.cookieConsent.necessary).toBe(true)
    })
  })

  describe('acceptAll', () => {
    it('sets necessary and analytics consent to true', async () => {
      const useCookieConsent = await loadCookieConsent()
      const { cookieConsent, acceptAll } = useCookieConsent()

      acceptAll()
      await nextTick()

      expect(cookieConsent.necessary).toBe(true)
      expect(cookieConsent.analytics).toBe(true)
    })
  })

  describe('acceptNecessary', () => {
    it('sets necessary consent to true and analytics consent to false', async () => {
      const useCookieConsent = await loadCookieConsent()
      const { cookieConsent, acceptNecessary } = useCookieConsent()

      acceptNecessary()
      await nextTick()

      expect(cookieConsent.necessary).toBe(true)
      expect(cookieConsent.analytics).toBe(false)
    })
  })

  describe('setConsent', () => {
    it('sets both consent flags and updates the choice metadata', async () => {
      const useCookieConsent = await loadCookieConsent()
      const { cookieConsent, setConsent } = useCookieConsent()

      setConsent({ necessary: false, analytics: true })
      await nextTick()

      expect(cookieConsent.necessary).toBe(false)
      expect(cookieConsent.analytics).toBe(true)
      expect(cookieConsent.timestamp).toBeGreaterThan(0)
      expect(cookieConsent.version).toBe(COOKIE_CONSENT_VERSION)
    })
  })

  describe('hasMadeChoice', () => {
    it('returns false before a choice and true after a choice', async () => {
      const useCookieConsent = await loadCookieConsent()
      const { hasMadeChoice, acceptNecessary } = useCookieConsent()

      expect(hasMadeChoice()).toBe(false)

      acceptNecessary()
      await nextTick()

      expect(hasMadeChoice()).toBe(true)
    })

    it('returns false when the consent version is outdated', async () => {
      const useCookieConsent = await loadCookieConsent()
      const { cookieConsent, hasMadeChoice, acceptNecessary } = useCookieConsent()

      acceptNecessary()
      await nextTick()
      cookieConsent.version = '2025-01-01'
      await nextTick()

      expect(hasMadeChoice()).toBe(false)
    })
  })

  describe('hasAnalyticsConsent', () => {
    it('returns false without analytics consent', async () => {
      const useCookieConsent = await loadCookieConsent()

      expect(useCookieConsent().hasAnalyticsConsent()).toBe(false)
    })

    it('returns true with current analytics consent', async () => {
      const useCookieConsent = await loadCookieConsent()
      const { hasAnalyticsConsent, acceptAll } = useCookieConsent()

      acceptAll()
      await nextTick()

      expect(hasAnalyticsConsent()).toBe(true)
    })

    it('returns false when the consent version is outdated', async () => {
      const useCookieConsent = await loadCookieConsent()
      const { cookieConsent, hasAnalyticsConsent, acceptAll } = useCookieConsent()

      acceptAll()
      await nextTick()
      cookieConsent.version = '2025-01-01'
      await nextTick()

      expect(hasAnalyticsConsent()).toBe(false)
    })
  })

  describe('persist', () => {
    it('writes the consent state to localStorage after a change', async () => {
      const useCookieConsent = await loadCookieConsent()
      const { acceptAll } = useCookieConsent()

      acceptAll()
      await nextTick()

      const stored = JSON.parse(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)!)
      expect(stored.necessary).toBe(true)
      expect(stored.analytics).toBe(true)
      expect(stored.version).toBe(COOKIE_CONSENT_VERSION)
      expect(stored.timestamp).toBeGreaterThan(0)
    })

    it('does not write to localStorage on initialization', async () => {
      const useCookieConsent = await loadCookieConsent()

      useCookieConsent()
      await nextTick()

      expect(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBeNull()
    })

    it('restores a matching consent state from localStorage', async () => {
      localStorage.setItem(
        COOKIE_CONSENT_STORAGE_KEY,
        JSON.stringify({
          necessary: true,
          analytics: true,
          timestamp: 12345,
          version: COOKIE_CONSENT_VERSION,
        }),
      )
      const useCookieConsent = await loadCookieConsent()
      const { cookieConsent, hasMadeChoice, hasAnalyticsConsent } = useCookieConsent()

      expect(cookieConsent.necessary).toBe(true)
      expect(cookieConsent.analytics).toBe(true)
      expect(cookieConsent.timestamp).toBe(12345)
      expect(cookieConsent.version).toBe(COOKIE_CONSENT_VERSION)
      expect(hasMadeChoice()).toBe(true)
      expect(hasAnalyticsConsent()).toBe(true)
    })

    it('resets a stored state with an outdated version', async () => {
      localStorage.setItem(
        COOKIE_CONSENT_STORAGE_KEY,
        JSON.stringify({
          necessary: true,
          analytics: true,
          timestamp: 12345,
          version: '2025-01-01',
        }),
      )
      const useCookieConsent = await loadCookieConsent()
      const { cookieConsent, hasMadeChoice, hasAnalyticsConsent } = useCookieConsent()

      expect(cookieConsent.necessary).toBe(true)
      expect(cookieConsent.analytics).toBe(false)
      expect(cookieConsent.timestamp).toBe(0)
      expect(cookieConsent.version).toBe(COOKIE_CONSENT_VERSION)
      expect(hasMadeChoice()).toBe(false)
      expect(hasAnalyticsConsent()).toBe(false)
    })
  })

  describe('resetConsent', () => {
    it('resets consent to the initial state', async () => {
      const useCookieConsent = await loadCookieConsent()
      const {
        cookieConsent,
        hasMadeChoice,
        hasAnalyticsConsent,
        acceptAll,
        resetConsent,
      } = useCookieConsent()

      acceptAll()
      await nextTick()
      resetConsent()
      await nextTick()

      expect(cookieConsent.necessary).toBe(true)
      expect(cookieConsent.analytics).toBe(false)
      expect(cookieConsent.timestamp).toBe(0)
      expect(cookieConsent.version).toBe(COOKIE_CONSENT_VERSION)
      expect(hasMadeChoice()).toBe(false)
      expect(hasAnalyticsConsent()).toBe(false)
    })
  })
})
