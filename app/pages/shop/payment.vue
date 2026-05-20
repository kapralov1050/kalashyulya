<template>
  <div class="payment-page">
    <div class="max-w-4xl mx-auto p-6">
      <h1 class="text-2xl font-bold mb-6">{{ printLocale('payment_page_title') }}</h1>

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
  const description = (route.query.description as string) || printLocale('payment_page_title')

  const loading = ref(true)
  const error = ref<string | null>(null)
  const redirecting = ref(false)

  onMounted(async () => {
    // Если paymentId уже создан для этого orderId — не создаём повторно
    const existingPaymentId = localStorage.getItem('pendingPaymentId')
    const existingOrderId = localStorage.getItem('pendingOrderId')
    if (existingPaymentId && existingOrderId === orderId) {
      redirecting.value = true
      loading.value = false
      window.location.href = `${window.location.origin}/shop/payment-success?paymentId=${existingPaymentId}`
      return
    }
    await createPayment()
  })

  const createPayment = async () => {
    try {
      const { createPayment } = useYookassaPayment()

      const { orderInfo } = storeToRefs(useOrdersStore())

      if (!orderId || !amount) {
        throw new Error('Missing required data')
      }

      const result = await createPayment({
        orderId,
        amount,
        currency: 'RUB',
        description,
        returnUrl: `${window.location.origin}/shop/payment-success`,
        customer: {
          email: orderInfo.value?.customer.email || '',
        },
      })

      if (result.success && result.confirmationUrl) {
        if (result.paymentId) {
          localStorage.setItem('pendingPaymentId', result.paymentId)
          localStorage.setItem('pendingOrderId', orderId)
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
