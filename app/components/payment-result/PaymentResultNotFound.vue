<script setup lang="ts">
  const { printLocale } = useLocales()

  defineProps<{
    paymentId: string
  }>()

  defineEmits<{
    goToShop: []
    goToTracking: []
  }>()

  const t = (key: string, fb: string) => printLocale(key, { defaultValue: fb })

  const FALLBACK = {
    statusCancelled: 'Оплата не завершена',
    subtitleNotFound: 'Платёж не найден.',
    backToShop: 'В магазин',
    trackOrder: 'Отследить заказ',
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
        {{ t('payment_success_subtitle_not_found', FALLBACK.subtitleNotFound) }}
      </p>
    </div>
    <div class="flex flex-col sm:flex-row gap-3">
      <UButton color="primary" size="lg" block @click="$emit('goToShop')">
        <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
        {{ t('shop_back_to_shop', FALLBACK.backToShop) }}
      </UButton>
      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        block
        @click="$emit('goToTracking')"
      >
        <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 mr-2" />
        {{ t('shop_tracking_link', FALLBACK.trackOrder) }}
      </UButton>
    </div>
  </div>
</template>
