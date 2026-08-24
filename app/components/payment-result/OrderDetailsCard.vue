<script setup lang="ts">
  import type { OrderInBase } from '~/types'

  const { printLocale } = useLocales()

  defineProps<{
    order: OrderInBase
  }>()

  const t = (key: string, fb: string) => printLocale(key, { defaultValue: fb })

  const FALLBACK = {
    details: 'Детали заказа',
    goods: 'Товары:',
    sum: 'Сумма оплаты:',
    delivery: 'Способ доставки:',
    deliveryLabel: 'Доставка',
    pickup: 'Самовывоз',
    date: 'Дата заказа:',
    dateMissing: 'Не указана',
  } as const

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU').format(price)

  const formatDate = (dateString: string) => {
    if (!dateString)
      return t('payment_success_date_not_specified', FALLBACK.dateMissing)
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime()))
      return t('payment_success_date_not_specified', FALLBACK.dateMissing)
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  }
</script>

<template>
  <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 space-y-6">
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {{ t('payment_success_details_title', FALLBACK.details) }}
      </h3>
      <div class="grid gap-4">
        <div class="py-3 border-b border-neutral-200 dark:border-neutral-700">
          <span class="text-neutral-600 dark:text-neutral-400 block mb-2">
            {{ t('order_goods_label', FALLBACK.goods) }}
          </span>
          <ul class="space-y-1">
            <li
              v-for="(item, i) in order.purchase?.order"
              :key="i"
              class="flex justify-between text-sm font-medium text-neutral-900
                dark:text-neutral-100"
            >
              <span>{{ item.title }}</span>
              <span
                v-if="item.amount > 1"
                class="text-neutral-500 dark:text-neutral-400 ml-2"
              >
                × {{ item.amount }}
              </span>
            </li>
          </ul>
        </div>

        <div
          class="flex justify-between items-start py-3 border-b
            border-neutral-200 dark:border-neutral-700"
        >
          <span class="text-neutral-600 dark:text-neutral-400">
            {{ t('payment_success_payment_sum_label', FALLBACK.sum) }}
          </span>
          <span
            class="text-right font-bold text-2xl text-green-600
              dark:text-green-400"
          >
            {{ formatPrice(order.totalPrice || 0) }} ₽
          </span>
        </div>

        <div
          class="flex justify-between items-start py-3 border-b
            border-neutral-200 dark:border-neutral-700"
        >
          <span class="text-neutral-600 dark:text-neutral-400">
            {{ t('order_delivery_method_label', FALLBACK.delivery) }}
          </span>
          <span
            class="text-right font-medium text-neutral-900
              dark:text-neutral-100"
          >
            <span
              v-if="order.customer?.delivery?.street"
              class="flex items-center gap-1"
            >
              <UIcon name="i-heroicons-truck" class="w-5 h-5" />
              {{ t('order_delivery', FALLBACK.deliveryLabel) }}
            </span>
            <span v-else class="flex items-center gap-1">
              <UIcon name="i-heroicons-bag" class="w-5 h-5" />
              {{ t('order_pickup', FALLBACK.pickup) }}
            </span>
          </span>
        </div>

        <div class="flex justify-between items-start py-3">
          <span class="text-neutral-600 dark:text-neutral-400">
            {{ t('payment_success_order_date_label', FALLBACK.date) }}
          </span>
          <span
            class="text-right font-medium text-neutral-900
              dark:text-neutral-100"
          >
            {{ formatDate(order.purchase?.createdAt || '') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
