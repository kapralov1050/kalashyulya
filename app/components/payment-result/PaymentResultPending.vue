<script setup lang="ts">
  import type { OrderInBase } from '~/types'
  import OrderDetailsCard from './OrderDetailsCard.vue'
  import OrderActions from './OrderActions.vue'

  const { printLocale } = useLocales()

  const props = defineProps<{
    order: OrderInBase | null
    paymentId: string
    timedOut: boolean
    switchingToManual: boolean
  }>()

  const emit = defineEmits<{
    retry: []
    switchToManual: []
    goToShop: []
  }>()

  const t = (key: string, fb: string) => printLocale(key, { defaultValue: fb })

  const FALLBACK = {
    statusPending: 'Ожидается оплата',
    subtitlePending: 'Завершите оплату, чтобы мы начали работу над заказом.',
    timedOut: 'Не получили подтверждение. Похоже, оплата не была завершена.',
    retry: 'Попробовать снова',
    manual: 'Оплатить переводом',
    backToShop: 'В магазин',
  } as const
</script>

<template>
  <div class="space-y-6">
    <div class="text-center">
      <UIcon
        name="i-heroicons-clock"
        class="w-16 h-16 text-orange-400 mb-4 mx-auto"
      />
      <h2 class="text-2xl font-bold mb-2">
        {{ t('payment_success_status_pending', FALLBACK.statusPending) }}
      </h2>
      <p class="text-neutral-600 dark:text-neutral-400">
        {{ t('payment_success_subtitle_pending', FALLBACK.subtitlePending) }}
      </p>
      <p
        v-if="props.timedOut"
        class="text-sm text-orange-600 dark:text-orange-400 mt-2"
      >
        {{ t('payment_success_status_check_timed_out', FALLBACK.timedOut) }}
      </p>
    </div>

    <OrderDetailsCard v-if="props.order" :order="props.order" />

    <OrderActions
      :actions="[
        {
          label: t('payment_success_retry_button', FALLBACK.retry),
          onClick: () => emit('retry'),
          color: 'primary',
          icon: 'i-heroicons-arrow-path',
          disabled: props.switchingToManual,
        },
        {
          label: t('payment_success_manual_button', FALLBACK.manual),
          onClick: () => emit('switchToManual'),
          color: 'neutral',
          variant: 'outline',
          icon: 'i-heroicons-banknotes',
          disabled: props.switchingToManual,
        },
        {
          label: t('shop_back_to_shop', FALLBACK.backToShop),
          onClick: () => emit('goToShop'),
          color: 'neutral',
          variant: 'ghost',
          icon: 'i-heroicons-arrow-left',
        },
      ]"
    />
  </div>
</template>
