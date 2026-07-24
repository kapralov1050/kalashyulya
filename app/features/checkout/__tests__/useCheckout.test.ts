import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckout } from '../useCheckout'
import { useCheckoutStore } from '../store'
import { showToast } from '~/helpers/showToast'

const consentState = { pdAgreed: true, hasConsent: true }
const addNewOrderMock = vi.fn().mockResolvedValue('order-id-123')
const routerPushMock = vi.fn()

vi.mock('~/composables/firebase/useFirebase', () => ({
  useFirebase: () => ({
    addNewOrder: addNewOrderMock,
    shopData: ref({ products: {} }),
    ordersData: ref(null),
  }),
}))

vi.mock('~/helpers/showToast', () => ({
  showToast: vi.fn(),
}))

;(globalThis as Record<string, unknown>).useConsent = () => ({
  hasValidConsent: () => consentState.hasConsent,
  consents: { pdAgreed: consentState.pdAgreed },
  resetConsent: () => {},
})

;(globalThis as Record<string, unknown>).useShop = () => ({
  sendOrderInfoTelegram: vi.fn().mockResolvedValue({ success: true }),
  sendOrderInfoEmail: vi.fn().mockResolvedValue({ success: true }),
})

vi.stubGlobal('useRouter', () => ({ push: routerPushMock }))

function fillValidContacts(store: ReturnType<typeof useCheckoutStore>) {
  store.form.name = 'Иван Иванов'
  store.form.email = 'test@example.com'
  store.form.messengers = ['phone']
  store.form.phone = '+79991234567'
}

function fillValidCheckoutForm(store: ReturnType<typeof useCheckoutStore>) {
  fillValidContacts(store)
  store.form.deliveryType = 'pickup'
  store.form.payment = 'manual'
  store.form.framing = 'none'
}

describe('useCheckout', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    consentState.hasConsent = true
    consentState.pdAgreed = true
    vi.clearAllMocks()
    routerPushMock.mockReset()
  })

  describe('visibleErrors', () => {
    it('returns no errors for untouched empty form on contacts step', () => {
      const { visibleErrors } = useCheckout()
      expect(visibleErrors.value).toEqual({})
    })

    it('shows error after touchField for invalid field', () => {
      const store = useCheckoutStore()
      const { visibleErrors, touchField } = useCheckout()

      store.form.name = 'X'
      touchField('name')

      expect(visibleErrors.value.name).toBeDefined()
    })

    it('returns all errors after submitAttempted becomes true', async () => {
      const store = useCheckoutStore()
      const { visibleErrors, submitAttempted, goTo } = useCheckout()

      goTo(0)
      store.form.name = ''
      store.form.email = ''
      store.form.messengers = []
      submitAttempted.value = true

      expect(visibleErrors.value.name).toBeDefined()
      expect(visibleErrors.value.email).toBeDefined()
      expect(visibleErrors.value.messengers).toBeDefined()
    })

    it('returns framing-specific error when submitAttempted and framing is empty', () => {
      const store = useCheckoutStore()
      const { visibleErrors, submitAttempted, goTo } = useCheckout()

      const framingIndex = 2
      goTo(framingIndex)
      store.form.framing = ''
      submitAttempted.value = true

      expect(visibleErrors.value.framing).toBe(
        'Пожалуйста, выберите вариант оформления',
      )
    })
  })

  describe('firstValidationError', () => {
    it('returns empty string when no errors', () => {
      const { firstValidationError } = useCheckout()
      expect(firstValidationError.value).toBe('')
    })

    it('returns first error message after touchField', () => {
      const store = useCheckoutStore()
      const { firstValidationError, touchField } = useCheckout()

      store.form.name = 'X'
      store.form.email = 'bad'
      touchField('name')
      touchField('email')

      expect(firstValidationError.value).toContain('минимум 2 символа')
    })
  })

  describe('submitAttempted reset on step change', () => {
    it('clears touchedFields and submitAttempted when currentStepId changes', async () => {
      const store = useCheckoutStore()
      const { visibleErrors, touchField, submitAttempted, goTo } = useCheckout()

      store.form.name = 'X'
      touchField('name')
      submitAttempted.value = true

      expect(visibleErrors.value.name).toBeDefined()

      goTo(1)
      await nextTick()
      goTo(0)
      await nextTick()

      expect(visibleErrors.value.name).toBeUndefined()
      expect(submitAttempted.value).toBe(false)
    })
  })

  describe('canProceed', () => {
    it('is false on contacts step with empty form', () => {
      const { canProceed, goTo } = useCheckout()
      goTo(0)
      expect(canProceed.value).toBe(false)
    })

    it('is true on contacts step with valid form', () => {
      const store = useCheckoutStore()
      const { canProceed, goTo } = useCheckout()

      fillValidContacts(store)
      goTo(0)

      expect(canProceed.value).toBe(true)
    })

    it('is false on payment step without consent', () => {
      const store = useCheckoutStore()
      const { canProceed, goTo } = useCheckout()

      fillValidCheckoutForm(store)
      consentState.hasConsent = false
      goTo(4)

      expect(canProceed.value).toBe(false)
    })

    it('is true on payment step with consent', () => {
      const store = useCheckoutStore()
      const { canProceed, goTo } = useCheckout()

      fillValidCheckoutForm(store)
      consentState.hasConsent = true
      goTo(4)

      expect(canProceed.value).toBe(true)
    })

    it('is false on framing step when framing is empty', () => {
      const store = useCheckoutStore()
      const { canProceed, goTo } = useCheckout()

      store.form.framing = ''
      goTo(2)

      expect(canProceed.value).toBe(false)
    })

    it('is true on framing step when framing is none', () => {
      const store = useCheckoutStore()
      const { canProceed, goTo } = useCheckout()

      store.form.framing = 'none'
      goTo(2)

      expect(canProceed.value).toBe(true)
    })

    it('is true on summary step regardless of form', () => {
      const { canProceed, goTo } = useCheckout()
      goTo(3)
      expect(canProceed.value).toBe(true)
    })
  })

  describe('advance', () => {
    it('moves to next step when canProceed is true', () => {
      const store = useCheckoutStore()
      const { advance, current, goTo } = useCheckout()

      fillValidContacts(store)
      goTo(0)
      const startIndex = current.value

      advance()

      expect(current.value).toBe(startIndex + 1)
    })

    it('sets submitAttempted when canProceed is false', () => {
      const { advance, submitAttempted, goTo } = useCheckout()

      goTo(0)
      expect(submitAttempted.value).toBe(false)

      advance()

      expect(submitAttempted.value).toBe(true)
    })

    it('triggers submit() on the last step', async () => {
      const store = useCheckoutStore()
      fillValidCheckoutForm(store)

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()

      await vi.waitFor(() => expect(addNewOrderMock).toHaveBeenCalled())
      await vi.waitFor(() =>
        expect(routerPushMock).toHaveBeenCalledWith('/shop'),
      )
    })
  })

  describe('submit', () => {
    it('blocks and shows toast when consent is missing', async () => {
      const store = useCheckoutStore()
      fillValidCheckoutForm(store)
      consentState.hasConsent = false

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()
      await nextTick()
      await nextTick()

      expect(addNewOrderMock).not.toHaveBeenCalled()
      expect(showToast).toHaveBeenCalledWith(
        'Подтвердите согласие',
        'Подтвердите согласие на обработку персональных данных',
        'heroicons:exclamation-circle',
      )
    })

    it('blocks and shows toast when form is invalid', async () => {
      const store = useCheckoutStore()
      store.form.name = 'X'
      store.form.email = ''
      store.form.messengers = []
      consentState.hasConsent = true

      const { advance, goTo } = useCheckout()
      goTo(4)

      advance()
      await nextTick()
      await nextTick()

      expect(addNewOrderMock).not.toHaveBeenCalled()
      expect(showToast).toHaveBeenCalledWith(
        'Проверьте данные',
        expect.any(String),
        'heroicons:exclamation-circle',
      )
    })
  })
})
