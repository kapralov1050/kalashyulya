type RateLimitState = {
  attempts: number
  firstAttemptAt: number | null
  blockedUntil: number | null
}

type RateLimitOptions = {
  key: string
  maxAttempts: number
  windowMs: number
}

type RateLimitApi = {
  attempts: ReturnType<typeof ref<number>>
  blockedUntil: ReturnType<typeof ref<number | null>>
  isBlocked: ReturnType<typeof computed<boolean>>
  remainingTimeMs: ReturnType<typeof computed<number>>
  recordAttempt: () => void
  reset: () => void
}

const instances = new Map<string, RateLimitApi>()

function createRateLimitInstance(opts: RateLimitOptions): RateLimitApi {
  const { key, maxAttempts, windowMs } = opts
  const attempts = ref(0)
  const firstAttemptAt = ref<number | null>(null)
  const blockedUntil = ref<number | null>(null)
  const now = ref(Date.now())
  const storageKey = `ratelimit:${key}`
  let timer: ReturnType<typeof setInterval> | undefined

  const isBlocked = computed(
    () => blockedUntil.value !== null && blockedUntil.value > now.value,
  )
  const remainingTimeMs = computed(() =>
    isBlocked.value ? Math.max(0, blockedUntil.value! - now.value) : 0,
  )

  function save(): void {
    if (typeof localStorage === 'undefined') return

    const state: RateLimitState = {
      attempts: attempts.value,
      firstAttemptAt: firstAttemptAt.value,
      blockedUntil: blockedUntil.value,
    }
    localStorage.setItem(storageKey, JSON.stringify(state))
  }

  function clearState(): void {
    attempts.value = 0
    firstAttemptAt.value = null
    blockedUntil.value = null
    save()
  }

  function load(): void {
    if (typeof localStorage === 'undefined') return

    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return

      const state = JSON.parse(raw) as Partial<RateLimitState>
      const currentTime = Date.now()
      const storedFirstAttemptAt = state.firstAttemptAt
        ? Number(state.firstAttemptAt)
        : null
      const storedAttempts = Number(state.attempts)
      const storedBlockedUntil = state.blockedUntil
        ? Number(state.blockedUntil)
        : null

      if (
        !Number.isFinite(storedAttempts)
        || storedFirstAttemptAt === null
        || !Number.isFinite(storedFirstAttemptAt)
        || storedFirstAttemptAt + windowMs <= currentTime
        || (storedBlockedUntil !== null && storedBlockedUntil <= currentTime)
      ) {
        clearState()
        return
      }

      attempts.value = Math.max(0, storedAttempts)
      firstAttemptAt.value = storedFirstAttemptAt
      blockedUntil.value =
        storedBlockedUntil && storedBlockedUntil > currentTime
          ? storedBlockedUntil
          : null
      now.value = currentTime
      save()
    } catch {
      clearState()
    }
  }

  function recordAttempt(): void {
    const currentTime = Date.now()
    now.value = currentTime

    if (isBlocked.value) {
      return
    }

    if (
      firstAttemptAt.value === null
      || firstAttemptAt.value + windowMs <= currentTime
    ) {
      attempts.value = 0
      firstAttemptAt.value = currentTime
    }

    if (attempts.value >= maxAttempts) {
      blockedUntil.value = currentTime + windowMs
    } else {
      attempts.value += 1
    }

    save()
  }

  function reset(): void {
    clearState()
    now.value = Date.now()
  }

  onMounted(() => {
    load()
    timer = setInterval(() => {
      now.value = Date.now()
      if (blockedUntil.value !== null && blockedUntil.value <= now.value) {
        clearState()
      }
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  return {
    attempts,
    blockedUntil,
    isBlocked,
    remainingTimeMs,
    recordAttempt,
    reset,
  }
}

export function useRateLimit(options: RateLimitOptions) {
  if (!instances.has(options.key)) {
    instances.set(options.key, createRateLimitInstance(options))
  }
  return instances.get(options.key)!
}
