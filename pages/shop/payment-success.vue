<template>
  <div class="payment-success-page">
    <div class="max-w-4xl mx-auto p-6">
      <!-- Загрузка -->
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
          {{ printLocale('payment_success_loading') }}
        </p>
        <p
          v-if="waitingForWebhook"
          class="text-sm text-neutral-500 dark:text-neutral-500 mt-2"
        >
          {{ printLocale('payment_success_webhook_waiting') }}
        </p>
      </div>

      <!-- Ошибка -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-20"
      >
        <div class="text-center">
          <UIcon
            name="i-heroicons-x-circle"
            class="w-16 h-16 text-red-500 mb-4"
          />
          <h2 class="text-2xl font-bold mb-2">{{ printLocale('tracking_error_title') }}</h2>
          <p class="text-neutral-600 dark:text-neutral-400 mb-6">{{ error }}</p>
          <div class="flex flex-col gap-3 max-w-sm">
            <UButton color="primary" size="lg" block @click="goToShop">
              {{ printLocale('shop_back_to_shop') }}
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              size="lg"
              block
              @click="goToTracking"
            >
              {{ printLocale('shop_tracking_link') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Успешная оплата -->
      <div v-else-if="order" class="space-y-6">
        <!-- Заголовок -->
        <div class="text-center">
          <UIcon
            v-if="order.status === 'Оплачен'"
            name="i-heroicons-check-circle"
            class="w-16 h-16 text-green-500 mb-4 mx-auto"
          />
          <UIcon
            v-else-if="order.status === 'Отменен'"
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
        </div>

        <!-- Информация о заказе -->
        <div
          class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6
            space-y-6"
        >
          <!-- Номер заказа -->
          <div
            class="bg-green-50 dark:bg-green-900/20 border border-green-200
              dark:border-green-800 rounded-lg p-4"
          >
            <div
              class="flex items-center gap-2 text-green-700 dark:text-green-400
                mb-1"
            >
              <UIcon name="i-heroicons-hashtag" class="w-5 h-5" />
              <span class="font-semibold">{{ printLocale('payment_success_tracking_number_label') }}</span>
            </div>
            <div
              class="text-2xl font-mono font-bold text-green-800
                dark:text-green-300 mb-2"
            >
              {{ order.paymentId || printLocale('payment_success_tracking_number_waiting') }}
            </div>
            <p class="text-sm text-green-700 dark:text-green-400">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-4 h-4 inline mr-1"
              />
              {{ printLocale('payment_success_save_hint') }}
            </p>
          </div>

          <!-- Детали заказа -->
          <div class="space-y-4">
            <h3
              class="text-lg font-semibold text-neutral-900
                dark:text-neutral-100"
            >
              Детали заказа
            </h3>

            <div class="grid gap-4">
              <!-- Товары -->
              <div
                class="py-3 border-b border-neutral-200 dark:border-neutral-700"
              >
                <span class="text-neutral-600 dark:text-neutral-400 block mb-2">
                  {{ printLocale('order_goods_label') }}
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
                  {{ printLocale('payment_success_payment_sum_label') }}
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
                  {{ printLocale('order_delivery_method_label') }}
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
                    {{ printLocale('order_delivery') }}
                  </span>
                  <span v-else class="flex items-center gap-1">
                    <UIcon name="i-heroicons-bag" class="w-5 h-5" />
                    {{ printLocale('order_pickup') }}
                  </span>
                </span>
              </div>

              <!-- Дата оплаты -->
              <div class="flex justify-between items-start py-3">
                <span class="text-neutral-600 dark:text-neutral-400">
                  Дата заказа:
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
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
          <p class="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {{ printLocale('payment_success_contact_text') }}
          </p>
        </div>

        <!-- Кнопки действий -->
        <div class="flex flex-col sm:flex-row gap-3">
          <UButton color="primary" size="lg" block @click="goToShop">
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
            {{ printLocale('shop_back_to_shop') }}
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            block
            @click="goToTracking"
          >
            <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 mr-2" />
            {{ printLocale('shop_tracking_link') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { OrderInBase } from '~/types'

  const { printLocale } = useLocales()
  const route = useRoute()
  const router = useRouter()
  const { allOrders } = storeToRefs(useOrdersStore())
  const { clearBasket } = useBasketStore()

  const loading = ref(true)
  const error = ref<string | null>(null)
  const order = ref<OrderInBase | null>(null)
  const waitingForWebhook = ref(false)
  const paymentId = ref<string | null>(null)

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU').format(price)

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указана'
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  const statusTitle = computed(() => {
    if (order.value?.status === 'Оплачен') return printLocale('payment_success_status_paid')
    if (order.value?.status === 'Отменен') return printLocale('payment_success_status_cancelled')
    return printLocale('payment_success_status_pending')
  })

  const statusSubtitle = computed(() => {
    if (order.value?.status === 'Оплачен')
      return printLocale('payment_success_subtitle_paid')
    if (order.value?.status === 'Отменен')
      return printLocale('payment_success_subtitle_cancelled')
    return printLocale('payment_success_subtitle_pending')
  })

  const foundOrder = computed(() => {
    if (!paymentId.value || !allOrders.value.length) return null
    return allOrders.value.find(o => o.paymentId === paymentId.value) ?? null
  })

  // Таймер ожидания webhook — даём Firebase 30 секунд на обновление
  let webhookTimeout: ReturnType<typeof setTimeout> | null = null
  // Таймаут на случай если Firebase вообще не ответил
  let loadingTimeout: ReturnType<typeof setTimeout> | null = null

  function onOrderFound(found: OrderInBase) {
    metrics.trackButtonClick('paymentSuccess')
    order.value = found
    loading.value = false
    waitingForWebhook.value = false
    if (webhookTimeout) clearTimeout(webhookTimeout)
    if (loadingTimeout) clearTimeout(loadingTimeout)
    clearBasket()
    localStorage.removeItem('pendingPaymentId')
    localStorage.removeItem('pendingOrderId')
  }

  watch(
    foundOrder,
    newOrder => {
      if (newOrder) {
        onOrderFound(newOrder)
      } else if (
        allOrders.value.length > 0 &&
        paymentId.value &&
        !webhookTimeout
      ) {
        // Заказы из Firebase загружены, но этот ещё без paymentId (webhook в пути)
        waitingForWebhook.value = true
        webhookTimeout = setTimeout(() => {
          if (!order.value) {
            error.value =
              'Заказ не найден. Проверьте ID платежа или свяжитесь с поддержкой.'
            loading.value = false
          }
        }, 30_000)
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    // Принимаем paymentId из URL (переданный success.vue) или из localStorage
    paymentId.value =
      (route.query.paymentId as string) ||
      localStorage.getItem('pendingPaymentId')

    if (!paymentId.value) {
      error.value =
        'Не передан ID платежа. Перейдите по ссылке из письма или свяжитесь с поддержкой.'
      loading.value = false
      return
    }

    // Страховочный таймаут — если Firebase не ответил вообще
    loadingTimeout = setTimeout(() => {
      if (loading.value) {
        error.value =
          'Превышено время ожидания. Проверьте статус заказа на странице отслеживания.'
        loading.value = false
      }
    }, 45_000)
  })

  onUnmounted(() => {
    if (webhookTimeout) clearTimeout(webhookTimeout)
    if (loadingTimeout) clearTimeout(loadingTimeout)
  })

  function goToShop() {
    router.push('/shop')
  }

  function goToTracking() {
    router.push('/shop/tracking')
  }

  watch(
    [order, error],
    () => {
      if (error.value) {
        useSeoMeta({
          title: 'Ошибка оплаты | Kalashyulya',
          description:
            'Произошла ошибка при обработке платежа. Попробуйте позже или свяжитесь с поддержкой.',
        })
      } else if (order.value) {
        useSeoMeta({
          title: 'Оплата прошла успешно | Kalashyulya',
          description:
            'Ваш заказ успешно оплачен. Информация о заказе и дальнейшие действия.',
        })
      } else {
        useSeoMeta({
          title: 'Оплата заказа | Kalashyulya',
          description: 'Загрузка информации о заказе...',
        })
      }
    },
    { immediate: true },
  )
</script>
