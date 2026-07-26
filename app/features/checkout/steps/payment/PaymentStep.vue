<template>
  <div class="space-y-4">
    <div
      class="flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all"
      :class="form.payment === 'yookassa'
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'"
      @click="form.payment = 'yookassa'"
    >
      <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center shrink-0">
        <UIcon name="heroicons:credit-card" class="w-5 h-5 text-primary-600" />
      </div>
      <div class="flex-1">
        <p class="font-semibold text-neutral-900 dark:text-white">Онлайн оплата</p>
        <p class="text-sm text-neutral-500">Карта, СБП, ЮMoney — через ЮKassa</p>
      </div>
      <div
        class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
        :class="form.payment === 'yookassa' ? 'border-primary-500' : 'border-neutral-300 dark:border-neutral-600'"
      >
        <div v-if="form.payment === 'yookassa'" class="w-2.5 h-2.5 rounded-full bg-primary-500" />
      </div>
    </div>

    <div
      class="flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all"
      :class="form.payment === 'manual'
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'"
      @click="form.payment = 'manual'"
    >
      <div class="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
        <UIcon name="heroicons:chat-bubble-left-right" class="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
      </div>
      <div class="flex-1">
        <p class="font-semibold text-neutral-900 dark:text-white">Перевод вручную</p>
        <p class="text-sm text-neutral-500">Свяжемся с вами для подтверждения</p>
      </div>
      <div
        class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
        :class="form.payment === 'manual' ? 'border-primary-500' : 'border-neutral-300 dark:border-neutral-600'"
      >
        <div v-if="form.payment === 'manual'" class="w-2.5 h-2.5 rounded-full bg-primary-500" />
      </div>
    </div>

    <!-- Мини-итог -->
    <div class="mt-2 p-5 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-2">
      <p class="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-3">Ваш заказ</p>
      <div v-for="item in shoppingCart" :key="item.item.id" class="flex justify-between text-sm">
        <span class="text-neutral-600 dark:text-neutral-300">
          {{ item.item.title }} × {{ item.amount }}
        </span>
        <span class="font-medium text-neutral-900 dark:text-white">
          ₽{{ item.item.price * item.amount }}
        </span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-neutral-500 dark:text-neutral-400">
          {{ form.deliveryType === 'pickup' ? 'Самовывоз (СПб)' : 'Доставка СДЭК' }}
        </span>
        <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ deliveryCost }}</span>
      </div>
      <div class="border-t border-neutral-200 dark:border-neutral-700 pt-3 flex justify-between font-bold">
        <span class="text-neutral-900 dark:text-white">К оплате сейчас</span>
        <span class="text-primary-600 dark:text-primary-400">₽{{ totalPurchaseAmount }}</span>
      </div>
      <p class="text-xs text-neutral-400 dark:text-neutral-500 pt-2 text-center">
        Доставка и оформление согласовываются и оплачиваются отдельно.
      </p>
    </div>

    <div class="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
      <AppConsentCheckbox v-model="pdAgreed" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCheckoutStore } from '../../store'
import { useDeliveryZone } from '~/composables/useDeliveryZone'

const { form } = useCheckoutStore()
const { shoppingCart, totalPurchaseAmount } = storeToRefs(useBasketStore())
const { getZone, ZONE_CONFIG } = useDeliveryZone()

const { consents } = useConsent()
const pdAgreed = computed({
  get: () => consents.pdAgreed,
  set: value => (consents.pdAgreed = value),
})

const deliveryCost = computed(() => {
  if (form.deliveryType === 'pickup') return 'Бесплатно'
  const zone = getZone(form.region)
  if (!zone) return '—'
  const price = ZONE_CONFIG[zone].minPrice
  return price ? `от ${price} ₽` : 'уточняется'
})
</script>
