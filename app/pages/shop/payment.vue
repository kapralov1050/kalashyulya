<template>
  <div class="payment-page">
    <div class="max-w-4xl mx-auto p-6">
      <h1 class="text-2xl font-bold mb-6">
        {{ printLocale('payment_page_title') }}
      </h1>

      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-12"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin w-12 h-12 mb-4"
        />
        <p>{{ printLocale('payment_creating') }}</p>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
      >
        <p class="text-red-700">{{ error }}</p>
        <UButton color="secondary" class="mt-4" @click="goBack">
          {{ printLocale('shop_back_to_shop') }}
        </UButton>
      </div>

      <div
        v-else-if="redirecting"
        class="flex flex-col items-center justify-center py-12"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin w-12 h-12 mb-4"
        />
        <p>{{ printLocale('payment_redirecting') }}</p>
      </div>

      <div v-else>
        <div class="bg-white dark:bg-neutral-800 rounded-lg p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">Заказ #{{ orderId }}</h2>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>{{ printLocale('payment_sum_label') }}</span>
              <span class="font-semibold">{{ amount }} ₽</span>
            </div>
            <div class="flex justify-between">
              <span>{{ printLocale('payment_description_label') }}</span>
              <span>{{ description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const { printLocale } = useLocales()

  const route = useRoute()
  const router = useRouter()

  const orderId = route.query.orderId as string
  const amount = parseFloat((route.query.amount as string) || '0')
  const description =
    (route.query.description as string) || printLocale('payment_page_title')

  const loading = ref(true)
  const error = ref<string | null>(null)
  const redirecting = ref(false)

  onMounted(async () => {
    const isRetry = route.query.retry === '1'

    // Если уже есть pending-платёж для этого orderId И не запрошен повтор —
    // не плодим новые платежи в ЮKassa, идём на success-страницу.
    // При retry=1 (возврат после canceled) — сбрасываем и создаём заново.
    const existingPaymentId = localStorage.getItem('pendingPaymentId')
    const existingOrderId = localStorage.getItem('pendingOrderId')
    if (!isRetry && existingPaymentId && existingOrderId === orderId) {
      redirecting.value = true
      loading.value = false
      window.location.href = `${window.location.origin}/shop/payment-success?paymentId=${existingPaymentId}`
      return
    }

    if (isRetry) {
      // Повтор после canceled/pending: чистим pending-ключи, чтобы createPayment
      // не привязался к старому платежу. existingPaymentId прокинем как
      // retryPaymentId — сервер явно отменит его в ЮKassa.
      localStorage.removeItem('pendingPaymentId')
      localStorage.removeItem('pendingOrderId')
    }

    await createPayment(isRetry ? existingPaymentId : undefined)
  })

  const createPayment = async (retryPaymentId?: string) => {
    try {
      const { createPayment } = useYookassaPayment()

      const ordersStore = useOrdersStore()
      const { orderInfo } = storeToRefs(ordersStore)

      if (!orderId || !amount) {
        throw new Error('Missing required data')
      }

      // Для повтора (retry=1) orderInfo может быть пустым после refresh —
      // подгружаем заказ из БД и берём email оттуда.
      let customerEmail = orderInfo.value?.customer.email || ''
      if (!customerEmail) {
        try {
          await ordersStore.loadOrders()
          const found = ordersStore.allOrders.find(o => String(o.id) === orderId)
          if (found?.customer?.email) {
            customerEmail = found.customer.email
          }
        } catch {
          // best-effort: если не удалось, createPayment всё равно попробует
          // с пустым email (валидация на сервере его не пропустит, тогда
          // покажем ошибку ниже)
        }
      }

      if (!customerEmail) {
        throw new Error('Не удалось получить email покупателя. Вернитесь в магазин и оформите заказ заново.')
      }

      const result = await createPayment({
        orderId,
        amount,
        currency: 'RUB',
        description,
        returnUrl: `${window.location.origin}/shop/payment-success`,
        customer: {
          email: customerEmail,
        },
        retryPaymentId,
      })

      if (result.success && result.confirmationUrl) {
        if (result.paymentId) {
          localStorage.setItem('pendingPaymentId', result.paymentId)
          localStorage.setItem('pendingOrderId', orderId)
        }

        try {
          await $fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            body: { paymentId: result.paymentId || '' },
          })
        } catch {
          // best-effort: paymentId will be saved via webhook fallback
        }

        redirecting.value = true
        metrics.trackButtonClick('paymentRedirect')
        setTimeout(() => {
          window.location.href = result.confirmationUrl!
        }, 500)
      } else {
        throw new Error(result.error || 'Failed to create payment')
      }
    } catch (err) {
      localStorage.removeItem('pendingPaymentId')
      localStorage.removeItem('pendingOrderId')
      error.value =
        err instanceof Error ? err.message : 'Ошибка создания платежа'
      metrics.trackButtonClick('paymentCreateError')
    } finally {
      loading.value = false
    }
  }

  const goBack = () => {
    router.push('/shop')
  }
</script>
