<template>
  <div class="space-y-3">
    <!-- Покупатель -->
    <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800">
        <p class="text-xs font-bold tracking-widest uppercase text-neutral-400">Покупатель</p>
        <button class="text-xs text-primary-500 hover:text-primary-600" @click="emit('go-to-id', 'contacts')">
          Изменить
        </button>
      </div>
      <div class="px-4 py-3 space-y-1.5 text-sm">
        <div class="flex justify-between">
          <span class="text-neutral-500">Имя</span>
          <span class="font-medium dark:text-white">{{ form.name || '—' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-neutral-500">Email</span>
          <span class="font-medium dark:text-white">{{ form.email || '—' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-neutral-500">Связь</span>
          <span class="font-medium dark:text-white">{{ messengerLabel }}</span>
        </div>
        <div v-if="form.phone" class="flex justify-between">
          <span class="text-neutral-500">Телефон</span>
          <span class="font-medium dark:text-white">{{ form.phone }}</span>
        </div>
        <div v-if="form.nickname" class="flex justify-between">
          <span class="text-neutral-500">Никнейм</span>
          <span class="font-medium dark:text-white">{{ form.nickname }}</span>
        </div>
      </div>
    </div>

    <!-- Доставка -->
    <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800">
        <p class="text-xs font-bold tracking-widest uppercase text-neutral-400">Доставка</p>
        <button class="text-xs text-primary-500 hover:text-primary-600" @click="emit('go-to-id', 'delivery')">
          Изменить
        </button>
      </div>
      <div class="px-4 py-3 space-y-1.5 text-sm">
        <div class="flex justify-between">
          <span class="text-neutral-500">Способ</span>
          <span class="font-medium dark:text-white">
            {{ form.deliveryType === 'pickup' ? 'Самовывоз (СПб)' : 'СДЭК' }}
          </span>
        </div>
        <template v-if="form.deliveryType === 'delivery'">
          <div v-if="form.address" class="flex justify-between">
            <span class="text-neutral-500">Адрес</span>
            <span class="font-medium dark:text-white text-right max-w-48">{{ form.address }}</span>
          </div>
          <div v-if="form.recipient" class="flex justify-between">
            <span class="text-neutral-500">Получатель</span>
            <span class="font-medium dark:text-white">{{ form.recipient }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">Стоимость</span>
            <span class="font-medium dark:text-white">{{ deliveryCost }}</span>
          </div>
        </template>
        <div v-else class="flex justify-between">
          <span class="text-neutral-500">Стоимость</span>
          <span class="font-medium text-emerald-600">Бесплатно</span>
        </div>
      </div>
    </div>

    <!-- Оформление -->
    <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800">
        <p class="text-xs font-bold tracking-widest uppercase text-neutral-400">Оформление</p>
        <button class="text-xs text-primary-500 hover:text-primary-600" @click="emit('go-to-id', 'framing')">
          Изменить
        </button>
      </div>
      <div class="px-4 py-3 space-y-1.5 text-sm">
        <div class="flex justify-between">
          <span class="text-neutral-500">Вариант</span>
          <span class="font-medium dark:text-white">{{ selectedFraming?.title || '—' }}</span>
        </div>
        <div v-if="selectedFraming?.price" class="flex justify-between">
          <span class="text-neutral-500">Стоимость</span>
          <span class="font-medium dark:text-white">
            от {{ selectedFraming.price.toLocaleString('ru') }} ₽
          </span>
        </div>
      </div>
    </div>

    <!-- Товары -->
    <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div class="px-4 py-3 bg-neutral-50 dark:bg-neutral-800">
        <p class="text-xs font-bold tracking-widest uppercase text-neutral-400">Товары</p>
      </div>
      <div class="px-4 py-3 space-y-2 text-sm">
        <div v-for="item in shoppingCart" :key="item.item.id" class="flex justify-between">
          <span class="text-neutral-600 dark:text-neutral-300">
            {{ item.item.title }} × {{ item.amount }}
          </span>
          <span class="font-medium dark:text-white">₽{{ item.item.price * item.amount }}</span>
        </div>
        <div class="border-t border-neutral-200 dark:border-neutral-700 pt-2 flex justify-between font-bold">
          <span class="dark:text-white">Итого</span>
          <span class="text-primary-600 dark:text-primary-400">₽{{ totalPurchaseAmount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCheckoutStore } from '../../store'
import { FRAMING_OPTIONS } from '../framing/config'
import { useDeliveryZone } from '~/composables/useDeliveryZone'

const emit = defineEmits<{ 'go-to-id': [id: string] }>()

const { form } = useCheckoutStore()
const { shoppingCart, totalPurchaseAmount } = storeToRefs(useBasketStore())
const { getZone, ZONE_CONFIG } = useDeliveryZone()

const messengerMap: Record<string, string> = { vk: 'ВКонтакте', tg: 'Телеграм', phone: 'Звонок' }
const messengerLabel = computed(() =>
  form.messengers.map(m => messengerMap[m]).filter(Boolean).join(', ') || '—'
)

const selectedFraming = computed(() => FRAMING_OPTIONS.find(o => o.value === form.framing))

const deliveryCost = computed(() => {
  const zone = getZone(form.region)
  if (!zone) return 'уточняется'
  const price = ZONE_CONFIG[zone].minPrice
  return price ? `от ${price} ₽` : 'уточняется'
})
</script>
