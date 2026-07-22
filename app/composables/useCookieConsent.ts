export const COOKIE_CONSENT_STORAGE_KEY = 'cookie_consent_v1'
export const COOKIE_CONSENT_VERSION = '2026-07-22'

export interface CookieConsentState {
  necessary: boolean
  analytics: boolean
  timestamp: number
  version: string
}

const initialState = (): CookieConsentState => ({
  necessary: true,
  analytics: false,
  timestamp: 0,
  version: COOKIE_CONSENT_VERSION,
})

function readFromStorage(): CookieConsentState | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>
    if (
      typeof parsed.necessary !== 'boolean'
      || typeof parsed.analytics !== 'boolean'
      || typeof parsed.timestamp !== 'number'
      || typeof parsed.version !== 'string'
    ) {
      return null
    }
    return {
      necessary: parsed.necessary,
      analytics: parsed.analytics,
      timestamp: parsed.timestamp,
      version: parsed.version,
    }
  } catch {
    return null
  }
}

function writeToStorage(state: CookieConsentState) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(state))
  } catch {
    return
  }
}

let state: ReturnType<typeof reactive<CookieConsentState>> | null = null
let scope: ReturnType<typeof effectScope> | null = null

export function useCookieConsent() {
  if (!state) {
    const restored = readFromStorage()
    state = reactive<CookieConsentState>(restored ?? initialState())

    if (restored && restored.version !== COOKIE_CONSENT_VERSION) {
      Object.assign(state, initialState())
    }

    if (import.meta.client) {
      scope = effectScope(true)
      scope.run(() => {
        watch(
          () => ({
            necessary: state!.necessary,
            analytics: state!.analytics,
            version: state!.version,
          }),
          (val) => {
            writeToStorage({ ...val, timestamp: Date.now() })
          },
          { deep: true },
        )
      })
    }
  }

  const hasMadeChoice = () =>
    Boolean(state!.timestamp) && state!.version === COOKIE_CONSENT_VERSION

  const hasAnalyticsConsent = (): boolean =>
    Boolean(state!.analytics) && state!.version === COOKIE_CONSENT_VERSION

  function acceptAll() {
    setConsent({ necessary: true, analytics: true })
  }

  function acceptNecessary() {
    setConsent({ necessary: true, analytics: false })
  }

  function setConsent(value: { necessary: boolean, analytics: boolean }) {
    state!.necessary = value.necessary
    state!.analytics = value.analytics
    state!.timestamp = Date.now()
    state!.version = COOKIE_CONSENT_VERSION
  }

  function resetConsent() {
    Object.assign(state!, initialState())
  }

  return {
    cookieConsent: state,
    hasMadeChoice,
    hasAnalyticsConsent,
    acceptAll,
    acceptNecessary,
    setConsent,
    resetConsent,
  }
}
