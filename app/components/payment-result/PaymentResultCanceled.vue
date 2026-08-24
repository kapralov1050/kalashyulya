<script setup lang="ts">
  import type { OrderInBase } from '~/types'
  import OrderDetailsCard from './OrderDetailsCard.vue'
  import OrderActions from './OrderActions.vue'

  const { printLocale } = useLocales()

  const props = defineProps<{
    order: OrderInBase | null
    paymentId: string
    switchingToManual: boolean
  }>()

  const emit = defineEmits<{
    retry: []
    switchToManual: []
    goToShop: []
  }>()

  const t = (key: string, fb: string) => printLocale(key, { defaultValue: fb })

  const FALLBACK = {
    statusCancelled: 'Оплата не завершена',
    subtitleCancelled: 'Заказ сохранён, но оплата не прошла.',
    retry: 'Попробовать снова',
    manual: 'Оплатить переводом',
    backToShop: 'В магазин',
  } as const
</script>

<template>
  <div class="space-y-6">
    <div class="text-center">
      <UIcon
        name="i-heroicons-x-circle"
        class="w-16 h-16 text-red-500 mb-4 mx-auto"
      />
      <h2 class="text-2xl font-bold mb-2">
        {{ t('payment_success_status_cancelled', FALLBACK.statusCancelled) }}
      </h2>
      <p class="text-neutral-600 dark:text-neutral-400">
        {{
          t('payment_success_subtitle_cancelled', FALLBACK.subtitleCancelled)
        }}
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
