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
          Загрузка информации о заказе...
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
          <h2 class="text-2xl font-bold mb-2">Ошибка</h2>
          <p class="text-neutral-600 dark:text-neutral-400 mb-6">{{ error }}</p>
          <div class="flex flex-col gap-3 max-w-sm">
            <UButton color="primary" size="lg" block @click="goToShop">
              Вернуться в магазин
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              size="lg"
              block
              @click="goToTracking"
            >
              Страница отслеживания заказа
            </UButton>
          </div>
        </div>
      </div>

      <!-- Успешная оплата -->
      <div v-else-if="order" class="space-y-6">
        <!-- Заголовок с анимацией -->
        <div class="text-center">
          <UIcon
            name="i-heroicons-check-circle"
            class="w-16 h-16 text-green-500 mb-4 mx-auto"
          />
          <h2 class="text-2xl font-bold mb-2">Оплата прошла успешно!</h2>
          <p class="text-neutral-600 dark:text-neutral-400">
            Спасибо за ваш заказ. Мы скоро свяжемся с вами.
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
              <span class="font-semibold">Номер для отслеживания</span>
            </div>
            <div
              class="text-2xl font-mono font-bold text-green-800
                dark:text-green-300 mb-2"
            >
              {{ order.paymentId || 'Ожидание...' }}
            </div>
            <p class="text-sm text-green-700 dark:text-green-400">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-4 h-4 inline mr-1"
              />
              Сохраните этот номер для отслеживания заказа
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
              <!-- Товар -->
              <div
                class="flex justify-between items-start py-3 border-b
                  border-neutral-200 dark:border-neutral-700"
              >
                <span class="text-neutral-600 dark:text-neutral-400">
                  Товар:
                </span>
                <span
                  class="text-right font-medium text-neutral-900
                    dark:text-neutral-100"
                >
                  {{ order.purchase?.order?.[0]?.title || 'Не указано' }}
                </span>
              </div>

              <!-- Цена -->
              <div
                class="flex justify-between items-start py-3 border-b
                  border-neutral-200 dark:border-neutral-700"
              >
                <span class="text-neutral-600 dark:text-neutral-400">
                  Сумма оплаты:
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
                  Способ доставки:
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
                    Доставка
                  </span>
                  <span v-else class="flex items-center gap-1">
                    <UIcon name="i-heroicons-bag" class="w-5 h-5" />
                    Самовывоз
                  </span>
                </span>
              </div>

              <!-- Дата оплаты -->
              <div class="flex justify-between items-start py-3">
                <span class="text-neutral-600 dark:text-neutral-400">
                  Дата оплаты:
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
            Спасибо за ваш заказ! Я скоро свяжусь с вами, чтобы подтвердить
            оплату и обсудить детали доставки. Вы можете следить за статусом
            заказа на странице отслеживания в любое время. Если у вас возникнут
            вопросы, можете написать мне в Telegram — @kalashyulyaa
          </p>
        </div>

        <!-- Кнопки действий -->
        <div class="flex flex-col sm:flex-row gap-3">
          <UButton color="primary" size="lg" block @click="goToShop">
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
            Вернуться в магазин
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            block
            @click="goToTracking"
          >
            <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 mr-2" />
            Страница отслеживания заказа
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { OrderInBase } from '~/types'

  const route = useRoute()
  const router = useRouter()
  const { allOrders } = storeToRefs(useOrdersStore())
  const { clearBasket } = useBasketStore()

  // Состояния
  const loading = ref(true)
  const error = ref<string | null>(null)
  const order = ref<OrderInBase | null>(null)

  // Получаем paymentId из query или localStorage
  const paymentId = ref<string | null>(null)

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price)
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указана'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Вычисляемый для поиска заказа
  const foundOrder = computed(() => {
    if (!paymentId.value || !allOrders.value.length) {
      return null
    }

    return (
      allOrders.value.find(order => order.paymentId === paymentId.value) || null
    )
  })

  // Отслеживаем изменения найденного заказа
  watch(
    foundOrder,
    newOrder => {
      if (newOrder) {
        order.value = newOrder
        loading.value = false
        // Очищаем корзину после успешной оплаты
        clearBasket()
      } else if (allOrders.value.length > 0 && paymentId.value) {
        // Если есть заказы, но не найден нужный
        error.value =
          'Заказ не найден. Проверьте ID платежа или свяжитесь с поддержкой.'
        loading.value = false
      }
    },
    { immediate: true },
  )

  // Загружаем данные при монтировании
  onMounted(() => {
    // Получаем paymentId из localStorage
    paymentId.value = localStorage.getItem('pendingPaymentId')

    if (!paymentId.value) {
      error.value =
        'Не передан ID платежа. Перейдите по ссылке из письма или свяжитесь с поддержкой.'
      loading.value = false
    }
  })

  // Навигация
  const goToShop = () => {
    router.push('/shop')
  }

  const goToTracking = () => {
    router.push('/shop/tracking')
  }

  // Динамическое SEO в зависимости от состояния
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
