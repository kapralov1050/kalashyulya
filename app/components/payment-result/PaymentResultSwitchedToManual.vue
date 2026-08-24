<script setup lang="ts">
  const { printLocale } = useLocales()

  defineProps<{
    orderId?: number | string
  }>()

  defineEmits<{
    goToShop: []
  }>()

  const t = (key: string, fb: string) => printLocale(key, { defaultValue: fb })

  const FALLBACK = {
    manualSwitched:
      'Спасибо! Заказ переведён в режим ручной оплаты. Я свяжусь с вами в Telegram, чтобы подтвердить детали.',
    manualSwitchedHint:
      'Реквизиты для перевода вы найдёте в Telegram-чате или на странице «Реквизиты».',
    backToShop: 'В магазин',
  } as const
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 text-center
      space-y-3"
  >
    <UIcon
      name="i-heroicons-check-circle"
      class="w-12 h-12 text-green-500 mx-auto"
    />
    <p class="text-lg font-medium text-neutral-900 dark:text-neutral-100">
      {{
        t('payment_success_manual_switched_message', FALLBACK.manualSwitched)
      }}
    </p>
    <p class="text-sm text-neutral-600 dark:text-neutral-400">
      {{
        t('payment_success_manual_switched_hint', FALLBACK.manualSwitchedHint)
      }}
    </p>
    <UButton color="primary" size="lg" @click="$emit('goToShop')">
      <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
      {{ t('shop_back_to_shop', FALLBACK.backToShop) }}
    </UButton>
  </div>
</template>
