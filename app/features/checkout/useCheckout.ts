import * as v from 'valibot'
import { useFirebase } from '~/composables/firebase/useFirebase'
import { updateDataByPath } from '~/helpers/firebase/manageDatabase'
import { showToast } from '~/helpers/showToast'
import {
  checkoutSchema,
  contactsSchema,
  deliverySchema,
  paymentSchema,
} from '~/helpers/valibot'
import type { Order } from '~/types'
import { CHECKOUT_STEPS } from './steps/config'
import { useCheckoutStore } from './store'
import { useStepper } from './useStepper'

export function useCheckout() {
  const store = useCheckoutStore()
  const router = useRouter()
  const basketStore = useBasketStore()
  const { shoppingCart } = storeToRefs(basketStore)
  const { addNewOrder, shopData } = useFirebase()
  const { sendOrderInfoTelegram, sendOrderInfoEmail } = useShop()
  const ordersStore = useOrdersStore()

  // Пропускаем шаг оформления, если все товары уже имеют оформление
  const skipFraming = computed(() =>
    shoppingCart.value.length > 0 &&
    shoppingCart.value.every(p => p.item.framing && p.item.framing.length > 0),
  )

  const activeSteps = computed(() =>
    CHECKOUT_STEPS.filter(s => s.id !== 'framing' || !skipFraming.value),
  )

  const stepper = useStepper(computed(() => activeSteps.value.length))
  const { current, isFirst, isLast, next, prev } = stepper

  const currentStep = computed(() => activeSteps.value[current.value])
  const currentStepId = computed(() => currentStep.value?.id)

  function goTo(i: number) {
    stepper.goTo(i)
  }

  function goToById(id: string) {
    const idx = activeSteps.value.findIndex(s => s.id === id)
    if (idx !== -1) stepper.goTo(idx)
  }

  const validationErrors = computed<Record<string, string>>(() => {
    const { form } = store
    const id = currentStepId.value
    const schema = id === 'contacts'
      ? contactsSchema
      : id === 'delivery'
        ? deliverySchema
        : id === 'payment'
          ? paymentSchema
          : undefined
    if (!schema) return {}
    const result = v.safeParse(schema, form)
    if (result.success) return {}
    const errors: Record<string, string> = {}
    for (const issue of result.issues) {
      const key = issue.path?.[0]?.key
      if (typeof key === 'string' && !errors[key]) errors[key] = issue.message
    }
    return errors
  })

  const touchedFields = reactive(new Set<string>())
  const submitAttempted = ref(false)

  function touchField(field: string) {
    touchedFields.add(field)
  }

  const visibleErrors = computed<Record<string, string>>(() => {
    if (
      currentStepId.value === 'framing'
      && submitAttempted.value
      && !store.form.framing
    ) {
      return { framing: 'Пожалуйста, выберите вариант оформления' }
    }
    if (submitAttempted.value) return validationErrors.value
    const out: Record<string, string> = {}
    for (const [key, msg] of Object.entries(validationErrors.value)) {
      if (touchedFields.has(key)) out[key] = msg
    }
    return out
  })

  const firstValidationError = computed(() => Object.values(visibleErrors.value)[0] ?? '')

  watch(currentStepId, () => {
    touchedFields.clear()
    submitAttempted.value = false
  })

  const canProceed = computed(() => {
    const { form } = store
    const id = currentStepId.value
    if (id === 'contacts' || id === 'delivery') {
      return Object.keys(validationErrors.value).length === 0
    }
    if (id === 'payment') {
      const { hasValidConsent } = useConsent()
      return Object.keys(validationErrors.value).length === 0 && hasValidConsent()
    }
    if (id === 'framing') return form.framing !== ''
    if (id === 'summary') return true
    return false
  })

  const isSubmitting = ref(false)

  async function submit() {
    if (isSubmitting.value) return
    submitAttempted.value = true
    const { hasValidConsent } = useConsent()
    if (!hasValidConsent()) {
      showToast(
        'Подтвердите согласие',
        'Подтвердите согласие на обработку персональных данных',
        'heroicons:exclamation-circle',
      )
      return
    }
    const { form } = store
    const validation = v.safeParse(checkoutSchema, form)
    if (!validation.success) {
      showToast(
        'Проверьте данные',
        validation.issues[0]?.message ?? 'Форма заполнена некорректно',
        'heroicons:exclamation-circle',
      )
      return
    }

    try {
      // Проверка наличия
      const products = Object.values(shopData.value?.products ?? {})
      const soldOut = basketStore.shoppingCart.filter(purchase => {
        const current = products.find(p => p.id === purchase.item.id)
        return !current || current.stock === 0 || current.isReserved
      })
      if (soldOut.length > 0) {
        metrics.trackButtonClick('stockCheckFailed')
        showToast(
          'Товары недоступны',
          soldOut.map(p => p.item.title).join(', ') + ' — уже нет в наличии',
          'heroicons:exclamation-circle',
        )
        return
      }

      isSubmitting.value = true
      const savedAmount = basketStore.totalPurchaseAmount

      const messengerLabels: Record<string, string> = {
        vk: 'Вконтакте',
        tg: 'Телеграм',
        phone: 'Звонок',
      }

      const orderData: Order = {
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          userMessenger: form.messengers.map(m => messengerLabels[m]).join(', '),
          userNickname: form.nickname || undefined,
          delivery: {
            type: form.deliveryType,
            city: form.city || undefined,
            recipient: form.recipient || undefined,
            address: form.address || undefined,
            street: form.street || undefined,
            house: form.house || undefined,
            apartment: form.apartment || undefined,
          },
        },
        purchase: {
          order: basketStore.shortPurchaseInfo,
          createdAt: new Date().toISOString(),
        },
        totalPrice: savedAmount,
        framing: skipFraming.value ? undefined : (form.framing || undefined),
        paymentMethod: form.payment || undefined,
      }

      metrics.trackButtonClick('completeOrderButton')

      ordersStore.orderInfo = orderData

      const orderId = await addNewOrder(orderData, 'orders/')

      const isTestOrder = ['localhost', '127.0.0.1', 'kalashyulya.vercel.app'].some(
        host => window.location.href.includes(host),
      )

      if (!isTestOrder) {
        const [telegramResult, emailResult] = await Promise.allSettled([
          sendOrderInfoTelegram(orderData),
          sendOrderInfoEmail(orderData),
        ])
        const failed: { telegram?: boolean; email?: boolean } = {}
        if (telegramResult.status === 'rejected' || !telegramResult.value?.success)
          failed.telegram = true
        if (emailResult.status === 'rejected' || !emailResult.value?.success)
          failed.email = true
        if (Object.keys(failed).length > 0)
          updateDataByPath({ notificationFailed: failed }, `orders/order_${orderId}`)
      }

      basketStore.clearBasket()
      metrics.trackButtonClick('orderSuccess')

      const paymentMethod = form.payment
      store.reset()

      if (paymentMethod === 'yookassa') {
        router.push({
          path: '/shop/payment',
          query: {
            orderId,
            amount: savedAmount.toString(),
            description: `Оплата заказа #${orderId}`,
          },
        })
      } else {
        showToast('Заказ оформлен!', 'Мы свяжемся с вами для подтверждения.', 'heroicons:check-circle')
        router.push('/shop')
      }
    } catch {
      metrics.trackButtonClick('orderError')
      showToast('Ошибка оформления заказа', 'Повторите позже', 'heroicons:exclamation-circle')
    } finally {
      isSubmitting.value = false
    }
  }

  function advance() {
    if (isLast.value) {
      submit()
    } else if (canProceed.value) {
      next()
    } else {
      submitAttempted.value = true
    }
  }

  return {
    current,
    isFirst,
    isLast,
    isSubmitting,
    next,
    prev,
    goTo,
    goToById,
    canProceed,
    validationErrors,
    visibleErrors,
    firstValidationError,
    advance,
    activeSteps,
    currentStep,
    currentStepId,
    store,
    touchField,
    touchedFields,
    submitAttempted,
  }
}
