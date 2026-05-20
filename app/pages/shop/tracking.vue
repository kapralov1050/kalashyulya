<template>
  <div class="tracking-page">
    <div class="max-w-2xl mx-auto p-6">
      <!-- Заголовок -->
      <div class="text-center mb-8">
        <h1
          class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2"
        >
          {{ printLocale('tracking_page_title') }}
        </h1>
        <p class="text-neutral-600 dark:text-neutral-400">
          {{ printLocale('tracking_page_subtitle') }}
        </p>
      </div>

      <!-- Форма поиска -->
      <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 mb-6">
        <div class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-neutral-700
                dark:text-neutral-300 mb-2"
            >
              {{ printLocale('tracking_payment_id_label') }}
            </label>
            <input
              v-model="paymentId"
              type="text"
              :placeholder="printLocale('tracking_payment_id_placeholder')"
              class="w-full px-4 py-3 rounded-lg border border-neutral-300
                dark:border-neutral-600 bg-white dark:bg-neutral-700
                text-neutral-900 dark:text-neutral-100 focus:outline-none
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors"
              @keyup.enter="searchOrder"
            />
          </div>

          <UButton
            color="primary"
            size="lg"
            block
            :disabled="!paymentId.trim() || loading"
            @click="searchOrder"
          >
            <UIcon
              v-if="loading"
              name="i-heroicons-arrow-path"
              class="animate-spin w-5 h-5 mr-2"
            />
            {{ loading ? printLocale('tracking_searching') : printLocale('tracking_find') }}
          </UButton>
        </div>
      </div>

      <!-- Загрузка -->
      <div
        v-if="loading && !error"
        class="flex flex-col items-center justify-center py-12"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin w-12 h-12 mb-4 text-neutral-600
            dark:text-neutral-400"
        />
        <p class="text-neutral-600 dark:text-neutral-400">{{ printLocale('tracking_loading') }}</p>
      </div>

      <!-- Ошибка -->
      <div
        v-else-if="error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200
          dark:border-red-800 rounded-xl p-6 mb-6"
      >
        <div class="flex items-start gap-3">
          <UIcon
            name="i-heroicons-exclamation-circle"
            class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
          />
          <div class="flex-1">
            <h3 class="font-semibold text-red-900 dark:text-red-100 mb-1">
              {{ printLocale('tracking_error_title') }}
            </h3>
            <p class="text-red-700 dark:text-red-300">{{ error }}</p>
            <UButton
              color="primary"
              variant="soft"
              size="sm"
              class="mt-4"
              @click="resetSearch"
            >
              {{ printLocale('tracking_retry') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Карточка заказа -->
      <div
        v-else-if="order"
        class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg
          overflow-hidden"
      >
        <!-- Заголовок карточки -->
        <div
          class="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700
            dark:to-blue-800 px-6 py-4"
        >
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-shopping-bag" class="w-6 h-6 text-white" />
            <h2 class="text-xl font-semibold text-white">
              Заказ #{{ order.id }}
            </h2>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Статус заказа -->
          <div class="flex items-center justify-between">
            <span
              class="text-sm font-medium text-neutral-600 dark:text-neutral-400"
            >
              {{ printLocale('tracking_status_label') }}
            </span>
            <span
              class="px-3 py-1.5 rounded-full text-sm font-medium text-white"
              :class="getStatusClass(order.status)"
            >
              {{ order.status }}
            </span>
          </div>

          <!-- Детали заказа -->
          <div class="border-t border-neutral-200 dark:border-neutral-700 pt-6">
            <h3
              class="text-lg font-semibold text-neutral-900
                dark:text-neutral-100 mb-4"
            >
              {{ printLocale('order_details_title') }}
            </h3>

            <div class="space-y-3">
              <!-- Товары -->
              <div class="flex justify-between items-start">
                <span class="text-neutral-600 dark:text-neutral-400 shrink-0">
                  {{ printLocale('order_goods_label') }}
                </span>
                <ul class="text-right space-y-0.5 max-w-xs">
                  <li
                    v-for="(item, i) in order.purchase?.order"
                    :key="i"
                    class="font-medium text-neutral-900 dark:text-neutral-100"
                  >
                    {{ item.title }}
                    <span
                      v-if="item.amount > 1"
                      class="text-neutral-500 dark:text-neutral-400"
                    >
                      × {{ item.amount }}
                    </span>
                  </li>
                </ul>
              </div>

              <!-- Цена -->
              <div class="flex justify-between items-start">
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ printLocale('order_sum_label') }}
                </span>
                <span
                  class="text-right font-bold text-lg text-green-600
                    dark:text-green-400"
                >
                  {{ formatPrice(order.totalPrice || 0) }} ₽
                </span>
              </div>

              <!-- Дата заказа -->
              <div class="flex justify-between items-start">
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ printLocale('order_date_label') }}
                </span>
                <span
                  class="text-right font-medium text-neutral-900
                    dark:text-neutral-100"
                >
                  {{ formatOrderDate(order.purchase?.createdAt || '') }}
                </span>
              </div>

              <!-- Способ доставки -->
              <div class="flex justify-between items-start">
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ printLocale('order_delivery_method_label') }}
                </span>
                <span
                  class="text-right font-medium text-neutral-900
                    dark:text-neutral-100"
                >
                  {{ getDeliveryMethod(order) }}
                </span>
              </div>

              <!-- ID платежа -->
              <div class="flex justify-between items-start">
                <span class="text-neutral-600 dark:text-neutral-400">
                  ID платежа:
                </span>
                <span
                  class="text-right font-mono text-sm text-neutral-900
                    dark:text-neutral-100 max-w-xs break-all"
                >
                  {{ order.paymentId || 'Не указан' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Информация о клиенте -->
          <div class="border-t border-neutral-200 dark:border-neutral-700 pt-6">
            <h3
              class="text-lg font-semibold text-neutral-900
                dark:text-neutral-100 mb-4"
            >
              {{ printLocale('tracking_customer_info_title') }}
            </h3>

            <div class="space-y-3">
              <!-- Имя -->
              <div class="flex justify-between items-start">
                <span class="text-neutral-600 dark:text-neutral-400">{{ printLocale('tracking_customer_name_label') }}</span>
                <span
                  class="text-right font-medium text-neutral-900
                    dark:text-neutral-100"
                >
                  {{ order.customer?.name || 'Не указано' }}
                </span>
              </div>

              <!-- Email -->
              <div class="flex justify-between items-start">
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ printLocale('tracking_customer_email_label') }}
                </span>
                <span
                  class="text-right font-medium text-neutral-900
                    dark:text-neutral-100"
                >
                  {{ order.customer?.email || 'Не указан' }}
                </span>
              </div>

              <!-- Телефон -->
              <div class="flex justify-between items-start">
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ printLocale('tracking_customer_phone_label') }}
                </span>
                <span
                  class="text-right font-medium text-neutral-900
                    dark:text-neutral-100"
                >
                  {{ order.customer?.phone || 'Не указан' }}
                </span>
              </div>

              <!-- Способ связи -->
              <div class="flex justify-between items-start">
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ printLocale('tracking_customer_contact_label') }}
                </span>
                <span
                  class="text-right font-medium text-neutral-900
                    dark:text-neutral-100"
                >
                  {{ order.customer?.userMessenger || 'Не указан' }}
                  <span
                    v-if="order.customer?.userNickname"
                    class="text-neutral-500 dark:text-neutral-400"
                  >
                    (@{{ order.customer.userNickname }})
                  </span>
                </span>
              </div>
            </div>
          </div>

          <!-- Адрес доставки (если есть) -->
          <div
            v-if="order.customer?.delivery?.street"
            class="border-t border-neutral-200 dark:border-neutral-700 pt-6"
          >
            <h3
              class="text-lg font-semibold text-neutral-900
                dark:text-neutral-100 mb-4"
            >
              {{ printLocale('tracking_delivery_address_title') }}
            </h3>

            <div class="text-neutral-700 dark:text-neutral-300 space-y-1">
              <p v-if="order.customer?.delivery?.city">
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ printLocale('tracking_city_label') }}
                </span>
                {{ order.customer.delivery.city }}
              </p>
              <p v-if="order.customer?.delivery?.street">
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ printLocale('tracking_street_label') }}
                </span>
                {{ order.customer.delivery.street }}
              </p>
              <p v-if="order.customer?.delivery?.house">
                <span class="text-neutral-600 dark:text-neutral-400">{{ printLocale('tracking_house_label') }}</span>
                {{ order.customer.delivery.house }}
              </p>
              <p v-if="order.customer?.delivery?.apartment">
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ printLocale('tracking_apartment_label') }}
                </span>
                {{ order.customer.delivery.apartment }}
              </p>
              <p v-if="order.customer?.delivery?.recipient">
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ printLocale('tracking_recipient_label') }}
                </span>
                {{ order.customer.delivery.recipient }}
              </p>
            </div>
          </div>

          <!-- Кнопка "Новый поиск" -->
          <div class="pt-4">
            <UButton
              color="neutral"
              variant="outline"
              block
              @click="resetSearch"
            >
              <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 mr-2" />
              {{ printLocale('tracking_find_other') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Пустое состояние -->
      <div v-else class="text-center py-12">
        <UIcon
          name="i-heroicons-document-magnifying-glass"
          class="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4"
        />
        <p class="text-neutral-600 dark:text-neutral-400">
          {{ printLocale('tracking_empty_hint') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { OrderInBase } from '~/types'

  const { printLocale } = useLocales()
  const toast = useToast()
  const { allOrders } = storeToRefs(useOrdersStore())

  // Состояния
  const paymentId = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const order = ref<OrderInBase | null>(null)

  /**
   * Форматирование цены
   */
  function formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU').format(price)
  }

  /**
   * Форматирование даты заказа
   */
  function formatOrderDate(dateString: string): string {
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

  /**
   * Получение способа доставки
   */
  function getDeliveryMethod(orderData: OrderInBase): string {
    if (orderData.customer?.delivery?.street) {
      return 'Доставка'
    }
    return 'Самовывоз'
  }

  /**
   * Получение CSS класса для статуса заказа
   */
  function getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      Оплачен: 'bg-green-500',
      'В обработке': 'bg-orange-500',
      Отменен: 'bg-red-500',
      'Новый заказ': 'bg-blue-500',
      'В работе': 'bg-yellow-500',
      Отправлен: 'bg-gray-500',
    }

    return statusMap[status] || 'bg-gray-500'
  }

  /**
   * Поиск заказа по paymentId
   */
  async function searchOrder(): Promise<void> {
    try {
      // Валидация
      if (!paymentId.value.trim()) {
        error.value = 'Введите ID платежа для поиска заказа.'
        return
      }

      // Сброс состояния
      loading.value = true
      error.value = null
      order.value = null

      // Поиск в allOrders
      const foundOrder = allOrders.value.find(
        order => order.paymentId === paymentId.value.trim(),
      )

      if (!foundOrder) {
        error.value =
          'Заказ с таким ID не найден. Проверьте введенный ID или свяжитесь с поддержкой.'
        return
      }

      order.value = foundOrder

      toast.add({
        title: 'Успешно',
        description: 'Заказ найден',
        color: 'success',
      })
    } catch {
      error.value = 'Не удалось выполнить поиск. Попробуйте позже.'

      toast.add({
        title: 'Ошибка',
        description: 'Не удалось найти заказ',
        color: 'error',
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Сброс поиска
   */
  function resetSearch(): void {
    paymentId.value = ''
    loading.value = false
    error.value = null
    order.value = null
  }

  // Динамическое SEO в зависимости от состояния
  watch([order, error], () => {
    if (error.value) {
      useSeoMeta({
        title: 'Заказ не найден | Kalashyulya',
        description: 'Заказ с указанным ID платежа не найден. Проверьте введенный ID или свяжитесь с поддержкой.',
      })
    } else if (order.value) {
      useSeoMeta({
        title: 'Отслеживание заказа | Kalashyulya',
        description: 'Отслеживайте статус вашего заказа по ID платежа',
      })
    } else {
      useSeoMeta({
        title: 'Отслеживание заказа | Kalashyulya',
        description: 'Отслеживайте статус вашего заказа по ID платежа',
      })
    }
  }, { immediate: true })
</script>
