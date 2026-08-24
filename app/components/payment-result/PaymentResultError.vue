<script setup lang="ts">
  const { printLocale } = useLocales()

  defineProps<{
    message: string
  }>()

  defineEmits<{
    goToShop: []
    goToTracking: []
  }>()

  const t = (key: string, fb: string) => printLocale(key, { defaultValue: fb })

  const FALLBACK = {
    errorTitle: 'Ошибка',
    backToShop: 'В магазин',
    trackOrder: 'Отследить заказ',
  } as const
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20">
    <div class="text-center">
      <UIcon name="i-heroicons-x-circle" class="w-16 h-16 text-red-500 mb-4" />
      <h2 class="text-2xl font-bold mb-2">
        {{ t('tracking_error_title', FALLBACK.errorTitle) }}
      </h2>
      <p class="text-neutral-600 dark:text-neutral-400 mb-6">
        {{ message }}
      </p>
      <div class="flex flex-col gap-3 max-w-sm">
        <UButton color="primary" size="lg" block @click="$emit('goToShop')">
          {{ t('shop_back_to_shop', FALLBACK.backToShop) }}
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          size="lg"
          block
          @click="$emit('goToTracking')"
        >
          {{ t('shop_tracking_link', FALLBACK.trackOrder) }}
        </UButton>
      </div>
    </div>
  </div>
</template>
