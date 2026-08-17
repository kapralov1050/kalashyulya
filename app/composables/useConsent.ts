export const CONSENT_STORAGE_KEY = 'consent_v1'
export const CONSENT_POLICY_VERSION = '2026-07-22'

export interface ConsentState {
  pdAgreed: boolean
  timestamp: number
  policyVersion: string
}

const initialState = (): ConsentState => ({
  pdAgreed: false,
  timestamp: 0,
  policyVersion: CONSENT_POLICY_VERSION,
})

function readFromStorage(): ConsentState | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ConsentState>
    if (
      typeof parsed.pdAgreed !== 'boolean'
      || typeof parsed.timestamp !== 'number'
      || typeof parsed.policyVersion !== 'string'
    ) {
      return null
    }
    return {
      pdAgreed: parsed.pdAgreed,
      timestamp: parsed.timestamp,
      policyVersion: parsed.policyVersion,
    }
  } catch {
    return null
  }
}

function writeToStorage(state: ConsentState) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state))
  } catch {
    return
  }
}

let state: ReturnType<typeof reactive<ConsentState>> | null = null
let scope: ReturnType<typeof effectScope> | null = null

export function useConsent() {
  if (!state) {
    const restored = readFromStorage()
    state = reactive<ConsentState>(restored ?? initialState())

    if (restored && restored.policyVersion !== CONSENT_POLICY_VERSION) {
      Object.assign(state, initialState())
    }

    if (import.meta.client) {
      scope = effectScope(true)
      scope.run(() => {
        watch(
          () => ({ pdAgreed: state!.pdAgreed, policyVersion: state!.policyVersion }),
          (val) => {
            writeToStorage({ ...val, timestamp: Date.now() })
          },
          { deep: true },
        )
      })
    }
  }

  const hasValidConsent = () => Boolean(state!.pdAgreed) && state!.policyVersion === CONSENT_POLICY_VERSION

  function resetConsent() {
    Object.assign(state!, initialState())
  }

  return {
    consents: state,
    hasValidConsent,
    resetConsent,
  }
}
