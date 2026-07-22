import { useFirebase } from '~/composables/firebase/useFirebase'
import { updateDataByPath } from '~/helpers/firebase/manageDatabase'
import { showToast } from '~/helpers/showToast'
import type { Order } from '~/types'
import { CHECKOUT_STEPS } from './steps/config'
import { useCheckoutStore } from './store'
import { useStepper } from './useStepper'
import { hasContent, hasFullName } from './validation'

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

  const canProceed = computed(() => {
    const { form } = store
    const id = currentStepId.value
    if (id === 'contacts') {
      return (
        form.name.trim().length > 1 &&
        form.email.includes('@') &&
        form.messengers.length > 0 &&
        (!form.messengers.includes('phone') || form.phone.trim().length > 5) &&
        (!form.messengers.some(m => ['vk', 'tg'].includes(m)) || form.nickname.trim().length > 1)
      )
    }
    if (id === 'delivery') {
      if (form.deliveryType === 'pickup') return true
      return (
        hasContent(form.city) &&
        hasFullName(form.recipient) &&
        hasContent(form.street) &&
        (hasContent(form.house) || hasContent(form.apartment))
      )
    }
    if (id === 'framing') return form.framing !== ''
    if (id === 'summary') return true
    if (id === 'payment') return form.payment !== ''
    return false
  })

  const isSubmitting = ref(false)

  async function submit() {
    if (isSubmitting.value) return
    const { form } = store

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
      store.reset()

      if (form.payment === 'yookassa') {
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
    advance,
    activeSteps,
    currentStep,
    currentStepId,
    store,
  }
}
