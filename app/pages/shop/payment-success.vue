<template>
  <div class="payment-success-page">
    <div class="max-w-4xl mx-auto p-6">
      <!-- Загрузка начального статуса -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-20"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin w-12 h-12 mb-4 text-neutral-600
            dark:text-neutral-400"
        />
        <p class="text-neutral-600 dark:text-neutral-400">
          {{ printLocale('payment_success_loading', { defaultValue: 'Проверяем статус оплаты...' }) }}
        </p>
      </div>

      <!-- Ошибка / платёж не найден -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-20"
      >
        <div class="text-center">
          <UIcon
            name="i-heroicons-x-circle"
            class="w-16 h-16 text-red-500 mb-4"
          />
          <h2 class="text-2xl font-bold mb-2">
            {{ printLocale('tracking_error_title', { defaultValue: 'Ошибка' }) }}
          </h2>
          <p class="text-neutral-600 dark:text-neutral-400 mb-6">{{ error }}</p>
          <div class="flex flex-col gap-3 max-w-sm">
            <UButton color="primary" size="lg" block @click="goToShop">
              {{ printLocale('shop_back_to_shop', { defaultValue: 'В магазин' }) }}
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              size="lg"
              block
              @click="goToTracking"
            >
              {{ printLocale('shop_tracking_link', { defaultValue: 'Отследить заказ' }) }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Основной блок: статус платежа получен -->
      <div v-else-if="paymentStatus" class="space-y-6">
        <!-- Заголовок по статусу -->
        <div class="text-center">
          <UIcon
            v-if="paymentStatus === 'succeeded'"
            name="i-heroicons-check-circle"
            class="w-16 h-16 text-green-500 mb-4 mx-auto"
          />
          <UIcon
            v-else-if="paymentStatus === 'canceled'"
            name="i-heroicons-x-circle"
            class="w-16 h-16 text-red-500 mb-4 mx-auto"
          />
          <UIcon
            v-else
            name="i-heroicons-clock"
            class="w-16 h-16 text-orange-400 mb-4 mx-auto"
          />
          <h2 class="text-2xl font-bold mb-2">{{ statusTitle }}</h2>
          <p class="text-neutral-600 dark:text-neutral-400">
            {{ statusSubtitle }}
          </p>
          <p
            v-if="paymentStatus === 'pending' || paymentStatus === 'waiting_for_capture'"
            class="text-sm text-neutral-500 dark:text-neutral-500 mt-2"
          >
            {{
              pollingTimedOut
                ? printLocale('payment_success_status_check_timed_out', {
                    defaultValue: 'Не получили подтверждение. Похоже, оплата не была завершена.',
                  })
                : printLocale('payment_success_webhook_waiting', {
                    defaultValue: 'Проверяем статус платежа каждые 5 секунд...',
                  })
            }}
          </p>
        </div>

        <!-- Кнопки для pending и canceled -->
        <div
          v-if="paymentStatus === 'pending' || paymentStatus === 'waiting_for_capture' || paymentStatus === 'canceled'"
          class="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <UButton
            v-if="paymentStatus === 'pending' || paymentStatus === 'waiting_for_capture'"
            color="neutral"
            variant="outline"
            size="lg"
            :disabled="manualChecking"
            @click="manualCheck"
          >
            <UIcon
              :name="manualChecking ? 'i-heroicons-arrow-path' : 'i-heroicons-arrow-path-circle'"
              :class="['w-5 h-5 mr-2', manualChecking && 'animate-spin']"
            />
            {{ printLocale('payment_success_check_again_button', { defaultValue: 'Проверить снова' }) }}
          </UButton>
          <UButton
            color="primary"
            size="lg"
            @click="retryPayment"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 mr-2" />
            {{ printLocale('payment_success_retry_button', { defaultValue: 'Попробовать снова' }) }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            size="lg"
            @click="goToShop"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
            {{ printLocale('shop_back_to_shop', { defaultValue: 'В магазин' }) }}
          </UButton>
        </div>

        <!-- Информация о заказе (не показываем для not_found) -->
        <div
          v-if="order"
          class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6
            space-y-6"
        >
          <!-- Номер заказа -->
          <div
            v-if="paymentStatus === 'succeeded'"
            class="bg-green-50 dark:bg-green-900/20 border border-green-200
              dark:border-green-800 rounded-lg p-4"
          >
            <div
              class="flex items-center gap-2 text-green-700 dark:text-green-400
                mb-1"
            >
              <UIcon name="i-heroicons-hashtag" class="w-5 h-5" />
              <span class="font-semibold">
                {{ printLocale('payment_success_tracking_number_label', { defaultValue: 'Номер для отслеживания' }) }}
              </span>
            </div>
            <div
              class="text-2xl font-mono font-bold text-green-800
                dark:text-green-300 mb-2"
            >
              {{ order.paymentId }}
            </div>
            <p class="text-sm text-green-700 dark:text-green-400">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-4 h-4 inline mr-1"
              />
              {{ printLocale('payment_success_save_hint', { defaultValue: 'Сохраните этот номер для отслеживания заказа' }) }}
            </p>
          </div>

          <!-- Детали заказа -->
          <div class="space-y-4">
            <h3
              class="text-lg font-semibold text-neutral-900
                dark:text-neutral-100"
            >
              {{ printLocale('payment_success_details_title', { defaultValue: 'Детали заказа' }) }}
            </h3>

            <div class="grid gap-4">
              <!-- Товары -->
              <div
                class="py-3 border-b border-neutral-200 dark:border-neutral-700"
              >
                <span class="text-neutral-600 dark:text-neutral-400 block mb-2">
                  {{ printLocale('order_goods_label', { defaultValue: 'Товары:' }) }}
                </span>
                <ul class="space-y-1">
                  <li
                    v-for="(item, i) in order.purchase?.order"
                    :key="i"
                    class="flex justify-between text-sm font-medium
                      text-neutral-900 dark:text-neutral-100"
                  >
                    <span>{{ item.title }}</span>
                    <span
                      v-if="item.amount > 1"
                      class="text-neutral-500 dark:text-neutral-400 ml-2"
                    >
                      × {{ item.amount }}
                    </span>
                  </li>
                </ul>
              </div>

              <!-- Цена -->
              <div
                class="flex justify-between items-start py-3 border-b
                  border-neutral-200 dark:border-neutral-700"
              >
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ printLocale('payment_success_payment_sum_label', { defaultValue: 'Сумма оплаты:' }) }}
                </span>
                <span
                  class="text-right font-bold text-2xl text-green-600
                    dark:text-green-400"
                >
                  {{ formatPrice(order.totalPrice || 0) }} ₽
                </span>
              </div>

              <!-- Способ доставки -->
              <div
                class="flex justify-between items-start py-3 border-b
                  border-neutral-200 dark:border-neutral-700"
              >
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ printLocale('order_delivery_method_label', { defaultValue: 'Способ доставки:' }) }}
                </span>
                <span
                  class="text-right font-medium text-neutral-900
                    dark:text-neutral-100"
                >
                  <span
                    v-if="order.customer?.delivery?.street"
                    class="flex items-center gap-1"
                  >
                    <UIcon name="i-heroicons-truck" class="w-5 h-5" />
                    {{ printLocale('order_delivery', { defaultValue: 'Доставка' }) }}
                  </span>
                  <span v-else class="flex items-center gap-1">
                    <UIcon name="i-heroicons-bag" class="w-5 h-5" />
                    {{ printLocale('order_pickup', { defaultValue: 'Самовывоз' }) }}
                  </span>
                </span>
              </div>

              <!-- Дата заказа -->
              <div class="flex justify-between items-start py-3">
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ printLocale('payment_success_order_date_label', { defaultValue: 'Дата заказа:' }) }}
                </span>
                <span
                  class="text-right font-medium text-neutral-900
                    dark:text-neutral-100"
                >
                  {{ formatDate(order.purchase?.createdAt || '') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Что будет дальше -->
        <div
          v-if="paymentStatus === 'succeeded'"
          class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6"
        >
          <p class="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {{ printLocale('payment_success_contact_text', { defaultValue: 'Спасибо за ваш заказ! Я скоро свяжусь с вами, чтобы подтвердить оплату и обсудить детали доставки.' }) }}
          </p>
        </div>

        <!-- Кнопки действий: succeeded или not_found -->
        <div
          v-if="paymentStatus === 'succeeded' || paymentStatus === 'not_found'"
          class="flex flex-col sm:flex-row gap-3"
        >
          <UButton color="primary" size="lg" block @click="goToShop">
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
            {{ printLocale('shop_back_to_shop', { defaultValue: 'В магазин' }) }}
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            block
            @click="goToTracking"
          >
            <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 mr-2" />
            {{ printLocale('shop_tracking_link', { defaultValue: 'Отследить заказ' }) }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { OrderInBase } from '~/types'
  import type { YookassaPaymentStatus } from '~/composables/useYookassaPayment'

  const { printLocale } = useLocales()
  const route = useRoute()
  const router = useRouter()
  const { allOrders } = storeToRefs(useOrdersStore())
  const { clearBasket } = useBasketStore()
  const { getPaymentStatus } = useYookassaPayment()

  const loading = ref(true)
  const error = ref<string | null>(null)
  const order = ref<OrderInBase | null>(null)
  const paymentId = ref<string | null>(null)
  const paymentStatus = ref<YookassaPaymentStatus | null>(null)
  const pollingTimedOut = ref(false)
  const manualChecking = ref(false)
  // Флаг: polling ещё активен (для pending/waiting_for_capture)
  let pollingTimer: ReturnType<typeof setInterval> | null = null
  let pollingAttempts = 0
  const POLLING_INTERVAL_MS = 5_000
  const POLLING_MAX_ATTEMPTS = 6 // 6 * 5s = 30 секунд — достаточно, чтобы поймать succeeded, но не заставлять пользователя ждать 2 минуты

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU').format(price)

  const formatDate = (dateString: string) => {
    if (!dateString) return printLocale('payment_success_date_not_specified', { defaultValue: 'Не указана' })
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return printLocale('payment_success_date_not_specified', { defaultValue: 'Не указана' })
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  }

  const statusTitle = computed(() => {
    if (paymentStatus.value === 'succeeded')
      return printLocale('payment_success_status_paid', { defaultValue: 'Оплата получена' })
    if (paymentStatus.value === 'canceled' || paymentStatus.value === 'not_found')
      return printLocale('payment_success_status_cancelled', { defaultValue: 'Оплата не завершена' })
    return printLocale('payment_success_status_pending', { defaultValue: 'Ожидается оплата' })
  })

  const statusSubtitle = computed(() => {
    if (paymentStatus.value === 'succeeded')
      return printLocale('payment_success_subtitle_paid', { defaultValue: 'Спасибо за заказ!' })
    if (paymentStatus.value === 'canceled')
      return printLocale('payment_success_subtitle_cancelled', { defaultValue: 'Заказ сохранён, но оплата не прошла.' })
    if (paymentStatus.value === 'not_found')
      return printLocale('payment_success_subtitle_not_found', { defaultValue: 'Платёж не найден.' })
    return printLocale('payment_success_subtitle_pending', { defaultValue: 'Завершите оплату, чтобы мы начали работу над заказом.' })
  })

  const foundOrder = computed(() => {
    if (!paymentId.value || !allOrders.value.length) return null
    return allOrders.value.find(o => o.paymentId === paymentId.value) ?? null
  })

  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  function startPolling() {
    stopPolling()
    pollingAttempts = 0
    pollingTimedOut.value = false
    pollingTimer = setInterval(async () => {
      pollingAttempts += 1
      if (pollingAttempts > POLLING_MAX_ATTEMPTS) {
        stopPolling()
        pollingTimedOut.value = true
        return
      }
      if (!paymentId.value) {
        stopPolling()
        return
      }
      const result = await getPaymentStatus(paymentId.value)
      if (result.success && result.status && result.status !== paymentStatus.value) {
        paymentStatus.value = result.status
        if (result.status !== 'pending' && result.status !== 'waiting_for_capture') {
          stopPolling()
          if (result.status === 'succeeded') {
            metrics.trackButtonClick('paymentSuccess')
            clearBasket()
            localStorage.removeItem('pendingPaymentId')
            localStorage.removeItem('pendingOrderId')
          }
          else {
            localStorage.removeItem('pendingPaymentId')
            localStorage.removeItem('pendingOrderId')
          }
        }
      }
      else if (!result.success) {
        stopPolling()
      }
    }, POLLING_INTERVAL_MS)
  }

  /**
   * Ручная проверка статуса — кнопка «Проверить снова» в UI.
   * Не зависит от polling. Если ЮKassa уже ответила «succeeded» или «canceled» —
   * мы сразу переключаемся в нужную ветку.
   * Даже если статус не изменился, сбрасывает pollingTimedOut и возобновляет polling —
   * иначе после таймаута кнопка выглядит «мёртвой».
   */
  async function manualCheck() {
    if (!paymentId.value || manualChecking.value) return
    manualChecking.value = true
    try {
      const result = await getPaymentStatus(paymentId.value)

      // Сетевая ошибка или пустой статус — оставляем UI как есть,
      // но если был timedOut — даём пользователю ещё попытку подождать.
      if (!result.success || !result.status) {
        if (pollingTimedOut.value) {
          pollingTimedOut.value = false
          startPolling()
        }
        return
      }

      // Пользователь явно запросил проверку — в любом случае даём polling ещё один шанс.
      const wasTimedOut = pollingTimedOut.value
      pollingTimedOut.value = false

      if (result.status !== paymentStatus.value) {
        paymentStatus.value = result.status
      }

      if (result.status !== 'pending' && result.status !== 'waiting_for_capture') {
        stopPolling()
        if (result.status === 'succeeded') {
          metrics.trackButtonClick('paymentSuccess')
          clearBasket()
          localStorage.removeItem('pendingPaymentId')
          localStorage.removeItem('pendingOrderId')
        }
        else {
          localStorage.removeItem('pendingPaymentId')
          localStorage.removeItem('pendingOrderId')
        }
      } else if (wasTimedOut) {
        // Возобновляем polling после ручной проверки, если до этого был таймаут
        startPolling()
      }
    } finally {
      manualChecking.value = false
    }
  }

  function onOrderFound(found: OrderInBase) {
    order.value = found
  }

  async function fetchStatus() {
    if (!paymentId.value) {
      error.value = printLocale('payment_success_no_payment_id_error', {
        defaultValue: 'Не передан ID платежа. Перейдите по ссылке из письма или свяжитесь с поддержкой.',
      })
      loading.value = false
      return
    }
    const result = await getPaymentStatus(paymentId.value)

    // not_found — запрос успешен, но платёж не найден в YooKassa
    if (result.success && result.status === 'not_found') {
      paymentStatus.value = 'not_found'
      loading.value = false
      localStorage.removeItem('pendingPaymentId')
      localStorage.removeItem('pendingOrderId')
      return
    }

    if (!result.success || !result.status) {
      error.value = result.error || printLocale('payment_success_status_check_failed', {
        defaultValue: 'Не удалось проверить статус платежа.',
      })
      loading.value = false
      return
    }
    paymentStatus.value = result.status
    loading.value = false

    if (result.status === 'succeeded') {
      metrics.trackButtonClick('paymentSuccess')
      clearBasket()
      localStorage.removeItem('pendingPaymentId')
      localStorage.removeItem('pendingOrderId')
    }
    else if (result.status === 'canceled') {
      localStorage.removeItem('pendingPaymentId')
      localStorage.removeItem('pendingOrderId')
    }
    else {
      // pending / waiting_for_capture → запускаем polling
      startPolling()
    }
  }

  onMounted(async () => {
    paymentId.value =
      (route.query.paymentId as string) ||
      localStorage.getItem('pendingPaymentId')

    if (!paymentId.value) {
      error.value = printLocale('payment_success_no_payment_id_error', {
        defaultValue: 'Не передан ID платежа. Перейдите по ссылке из письма или свяжитесь с поддержкой.',
      })
      loading.value = false
      return
    }

    // Параллельно: грузим заказы из БД (для деталей) + проверяем статус в ЮKassa
    await Promise.all([
      useOrdersStore().loadOrders().catch(() => {}),
      fetchStatus(),
    ])
  })

  // Когда заказы подгрузились — подцепить детали по paymentId
  watch(foundOrder, newOrder => {
    if (newOrder) onOrderFound(newOrder)
  }, { immediate: true })

  onUnmounted(() => {
    stopPolling()
  })

  function goToShop() {
    router.push('/shop')
  }

  function goToTracking() {
    router.push('/shop/tracking')
  }

  function retryPayment() {
    if (!paymentId.value) {
      router.push('/shop')
      return
    }

    // Сбрасываем pending-ключи в localStorage, чтобы /shop/payment
    // не использовал старый (canceled) paymentId.
    localStorage.removeItem('pendingPaymentId')
    localStorage.removeItem('pendingOrderId')

    // Если order ещё не загружен — пытаемся найти в allOrders по paymentId.
    // Fallback: если вообще не нашли (order=null), идём в магазин.
    const foundOrder = order.value
      ?? allOrders.value.find(o => o.paymentId === paymentId.value)
      ?? null
    if (!foundOrder) {
      router.push('/shop')
      return
    }

    const orderId = String(foundOrder.id)
    const amount = foundOrder.totalPrice || 0
    const description = printLocale('payment_success_order_payment_description', {
      params: { orderId },
      defaultValue: `Оплата заказа #${orderId}`,
    })
    router.push({
      path: '/shop/payment',
      query: { orderId, amount: String(amount), description, retry: '1' },
    })
  }

  watch(
    [paymentStatus, error],
    () => {
      if (error.value) {
        useSeoMeta({
          title: 'Ошибка оплаты | Kalashyulya',
          description:
            'Произошла ошибка при обработке платежа. Попробуйте позже или свяжитесь с поддержкой.',
        })
      } else if (paymentStatus.value === 'succeeded') {
        useSeoMeta({
          title: 'Оплата прошла успешно | Kalashyulya',
          description:
            'Ваш заказ успешно оплачен. Информация о заказе и дальнейшие действия.',
        })
      } else if (paymentStatus.value === 'canceled' || paymentStatus.value === 'not_found') {
        useSeoMeta({
          title: 'Оплата не завершена | Kalashyulya',
          description:
            'Оплата не была завершена. Вы можете повторить попытку или связаться с поддержкой.',
        })
      } else {
        useSeoMeta({
          title: 'Ожидание оплаты | Kalashyulya',
          description: 'Проверяем статус платежа в платёжной системе...',
        })
      }
    },
    { immediate: true },
  )
</script>