<script setup lang="ts">
  import type { OrderInBase } from '~/types'
  import OrderDetailsCard from './OrderDetailsCard.vue'

  const { printLocale } = useLocales()

  const props = defineProps<{
    order: OrderInBase | null
  }>()

  defineEmits<{
    'navigate-to-shop': []
    'navigate-to-tracking': []
  }>()

  const t = (key: string, fb: string) => printLocale(key, { defaultValue: fb })

  const FALLBACK = {
    statusPaid: 'Оплата получена',
    subtitlePaid: 'Спасибо за заказ!',
    backToShop: 'В магазин',
    trackOrder: 'Отследить заказ',
    contactText:
      'Спасибо за ваш заказ! Я скоро свяжусь с вами, чтобы подтвердить оплату и обсудить детали доставки.',
    trackingNumber: 'Номер для отслеживания',
    saveHint: 'Сохраните этот номер для отслеживания заказа',
  } as const
</script>

<template>
  <div class="space-y-6">
    <div class="text-center">
      <UIcon
        name="i-heroicons-check-circle"
        class="w-16 h-16 text-green-500 mb-4 mx-auto"
      />
      <h2 class="text-2xl font-bold mb-2">
        {{ t('payment_success_status_paid', FALLBACK.statusPaid) }}
      </h2>
      <p class="text-neutral-600 dark:text-neutral-400">
        {{ t('payment_success_subtitle_paid', FALLBACK.subtitlePaid) }}
      </p>
    </div>

    <div
      v-if="props.order"
      class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 space-y-6"
    >
      <div
        class="bg-green-50 dark:bg-green-900/20 border border-green-200
          dark:border-green-800 rounded-lg p-4"
      >
        <div
          class="flex items-center gap-2 text-green-700 dark:text-green-400
            mb-1"
        >
          <UIcon name="i-heroicons-hashtag" class="w-5 h-5" />
          <span class="font-semibold">
            {{
              t(
                'payment_success_tracking_number_label',
                FALLBACK.trackingNumber,
              )
            }}
          </span>
        </div>
        <div
          class="text-2xl font-mono font-bold text-green-800 dark:text-green-300
            mb-2"
        >
          {{ props.order.paymentId }}
        </div>
        <p class="text-sm text-green-700 dark:text-green-400">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-4 h-4 inline mr-1"
          />
          {{ t('payment_success_save_hint', FALLBACK.saveHint) }}
        </p>
      </div>

      <OrderDetailsCard :order="props.order" />
    </div>

    <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
      <p class="text-neutral-700 dark:text-neutral-300 leading-relaxed">
        {{ t('payment_success_contact_text', FALLBACK.contactText) }}
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-3">
      <UButton
        color="primary"
        size="lg"
        block
        @click="$emit('navigate-to-shop')"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
        {{ t('shop_back_to_shop', FALLBACK.backToShop) }}
      </UButton>
      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        block
        @click="$emit('navigate-to-tracking')"
      >
        <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 mr-2" />
        {{ t('shop_tracking_link', FALLBACK.trackOrder) }}
      </UButton>
    </div>
  </div>
</template>
