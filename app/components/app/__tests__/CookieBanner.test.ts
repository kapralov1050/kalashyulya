import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import CookieBanner from '../CookieBanner.vue'

const storageKey = 'cookie_consent_v1'
const consentVersion = '2026-07-22'

const stubs = {
  UCard: {
    template: '<div><slot /></div>',
  },
  UButton: {
    template: '<button><slot /></button>',
  },
  NuxtLink: {
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  },
}

function createConsentMock() {
  const stored = localStorage.getItem(storageKey)
  const parsed = stored ? JSON.parse(stored) : null
  const hasChoice = ref(
    Boolean(parsed?.timestamp) && parsed?.version === consentVersion,
  )

  function save(analytics: boolean) {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        necessary: true,
        analytics,
        timestamp: Date.now(),
        version: consentVersion,
      }),
    )
    hasChoice.value = true
  }

  const consent = {
    hasMadeChoice: vi.fn(() => hasChoice.value),
    acceptAll: vi.fn(() => save(true)),
    acceptNecessary: vi.fn(() => save(false)),
  }

  ;(globalThis as Record<string, unknown>).useCookieConsent = vi.fn(() => consent)

  return consent
}

function mountBanner() {
  const consent = createConsentMock()
  const wrapper = mount(CookieBanner, {
    global: { stubs },
  })

  return { consent, wrapper }
}

function findButtonByText(wrapper: ReturnType<typeof mount>, text: string) {
  return wrapper.findAll('button').find((button) => button.text() === text)!
}

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  describe('visibility', () => {
    it('does not show when consent already exists', () => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          necessary: true,
          analytics: true,
          timestamp: 1,
          version: consentVersion,
        }),
      )

      const { wrapper } = mountBanner()

      expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    })

    it('shows on the first visit', () => {
      const { wrapper } = mountBanner()

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    })
  })

  describe('accept buttons', () => {
    it('accepts all cookies and hides the banner', async () => {
      const { consent, wrapper } = mountBanner()

      await findButtonByText(wrapper, 'Принять').trigger('click')
      await nextTick()

      expect(consent.acceptAll).toHaveBeenCalledOnce()
      expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
      expect(JSON.parse(localStorage.getItem(storageKey)!)).toMatchObject({
        necessary: true,
        analytics: true,
      })
    })

    it('accepts only necessary cookies with analytics disabled', async () => {
      const { consent, wrapper } = mountBanner()

      await findButtonByText(wrapper, 'Только необходимые').trigger('click')
      await nextTick()

      expect(consent.acceptNecessary).toHaveBeenCalledOnce()
      expect(JSON.parse(localStorage.getItem(storageKey)!)).toMatchObject({
        necessary: true,
        analytics: false,
      })
    })

    it('accepts all cookies when closed', async () => {
      const { consent, wrapper } = mountBanner()

      await wrapper.find('button[aria-label="Закрыть"]').trigger('click')

      expect(consent.acceptAll).toHaveBeenCalledOnce()
    })
  })

  describe('settings', () => {
    it('reveals cookie details', async () => {
      const { wrapper } = mountBanner()

      expect(wrapper.text()).not.toContain('Firebase Authentication')

      await findButtonByText(wrapper, 'Настройки').trigger('click')

      expect(wrapper.text()).toContain('Firebase Authentication')
      expect(wrapper.text()).toContain('Аналитические и рекламные cookies')
      expect(findButtonByText(wrapper, 'Скрыть').exists()).toBe(true)
    })
  })

  describe('privacy link', () => {
    it('renders a link to the privacy policy', () => {
      const { wrapper } = mountBanner()
      const link = wrapper.find('a[href="/privacy"]')

      expect(link.exists()).toBe(true)
      expect(link.text()).toContain('Политике обработки персональных данных')
    })
  })
})
