<script setup lang="ts">
  import type { PaymentResultState } from '~/composables/usePaymentResultState'
  import { usePaymentResult } from '~/composables/usePaymentResult'
  import PaymentResultSuccess from '~/components/payment-result/PaymentResultSuccess.vue'
  import PaymentResultPending from '~/components/payment-result/PaymentResultPending.vue'
  import PaymentResultCanceled from '~/components/payment-result/PaymentResultCanceled.vue'
  import PaymentResultNotFound from '~/components/payment-result/PaymentResultNotFound.vue'
  import PaymentResultError from '~/components/payment-result/PaymentResultError.vue'
  import PaymentResultSwitchedToManual from '~/components/payment-result/PaymentResultSwitchedToManual.vue'

  const { printLocale } = useLocales()
  const route = useRoute()

  const t = (key: string, fb: string) => printLocale(key, { defaultValue: fb })

  const initialPaymentId = ref<string | null>(
    (route.query.paymentId as string) ||
      localStorage.getItem('pendingPaymentId'),
  )

  const {
    state,
    switchingToManual,
    init,
    retryPayment,
    switchToManual,
    goToShop,
    goToTracking,
  } = usePaymentResult(initialPaymentId)

  type S<K extends PaymentResultState['kind']> = Extract<
    PaymentResultState,
    { kind: K }
  >
  const ofKind = <K extends PaymentResultState['kind']>(
    kind: K,
  ): S<K> | undefined =>
    state.value.kind === kind ? (state.value as S<K>) : undefined

  onMounted(() => init())

  watch(
    state,
    s => {
      if (s.kind === 'error') {
        useSeoMeta({
          title: 'Ошибка оплаты | Kalashyulya',
          description:
            'Произошла ошибка при обработке платежа. Попробуйте позже или свяжитесь с поддержкой.',
        })
      } else if (s.kind === 'switchedToManual') {
        useSeoMeta({
          title: 'Заказ ожидает ручной оплаты | Kalashyulya',
          description:
            'Заказ переведён в режим ручной оплаты. Юлия свяжется с вами для подтверждения.',
        })
      } else if (s.kind === 'succeeded') {
        useSeoMeta({
          title: 'Оплата прошла успешно | Kalashyulya',
          description:
            'Ваш заказ успешно оплачен. Информация о заказе и дальнейшие действия.',
        })
      } else if (s.kind === 'canceled' || s.kind === 'notFound') {
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

<template>
  <div class="payment-result-page">
    <div class="max-w-4xl mx-auto p-6">
      <div
        v-if="state.kind === 'loading'"
        class="flex flex-col items-center justify-center py-20"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin w-12 h-12 mb-4 text-neutral-600
            dark:text-neutral-400"
        />
        <p class="text-neutral-600 dark:text-neutral-400">
          {{ t('payment_success_loading', 'Проверяем статус оплаты...') }}
        </p>
      </div>

      <PaymentResultSuccess
        v-else-if="ofKind('succeeded')"
        :order="ofKind('succeeded')!.order"
        @navigate-to-shop="goToShop"
        @navigate-to-tracking="goToTracking"
      />

      <PaymentResultPending
        v-else-if="ofKind('pending')"
        :order="ofKind('pending')!.order"
        :payment-id="ofKind('pending')!.paymentId"
        :timed-out="ofKind('pending')!.timedOut"
        :switching-to-manual="switchingToManual"
        @retry="retryPayment"
        @switch-to-manual="switchToManual"
        @go-to-shop="goToShop"
      />

      <PaymentResultCanceled
        v-else-if="ofKind('canceled')"
        :order="ofKind('canceled')!.order"
        :payment-id="ofKind('canceled')!.paymentId"
        :switching-to-manual="switchingToManual"
        @retry="retryPayment"
        @switch-to-manual="switchToManual"
        @go-to-shop="goToShop"
      />

      <PaymentResultNotFound
        v-else-if="ofKind('notFound')"
        :payment-id="ofKind('notFound')!.paymentId"
        @go-to-shop="goToShop"
        @go-to-tracking="goToTracking"
      />

      <PaymentResultError
        v-else-if="ofKind('error')"
        :message="ofKind('error')!.message"
        @go-to-shop="goToShop"
        @go-to-tracking="goToTracking"
      />

      <PaymentResultSwitchedToManual
        v-else-if="ofKind('switchedToManual')"
        :order-id="ofKind('switchedToManual')!.order?.id"
        @go-to-shop="goToShop"
      />
    </div>
  </div>
</template>
