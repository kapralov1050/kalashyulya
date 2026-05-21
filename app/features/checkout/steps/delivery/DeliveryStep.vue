<template>
  <div class="space-y-5">
    <div class="grid grid-cols-2 gap-3">
      <button
        class="p-4 rounded-xl border-2 text-left transition-all"
        :class="form.deliveryType === 'pickup'
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'"
        @click="form.deliveryType = 'pickup'"
      >
        <UIcon name="heroicons:building-storefront" class="w-6 h-6 mb-2 text-primary-500" />
        <p class="font-semibold text-sm text-neutral-900 dark:text-white">Самовывоз</p>
        <p class="text-xs text-neutral-500 mt-0.5">Бесплатно</p>
      </button>
      <button
        class="p-4 rounded-xl border-2 text-left transition-all"
        :class="form.deliveryType === 'delivery'
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'"
        @click="form.deliveryType = 'delivery'"
      >
        <UIcon name="heroicons:truck" class="w-6 h-6 mb-2 text-primary-500" />
        <p class="font-semibold text-sm text-neutral-900 dark:text-white">Доставка СДЭК</p>
        <p class="text-xs text-neutral-500 mt-0.5">По России, до ПВЗ</p>
      </button>
    </div>

    <Transition name="slide-up">
      <div v-if="form.deliveryType === 'delivery'" class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Город</label>
          <UInput
            v-model="addressQuery"
            size="xl"
            placeholder="Начните вводить город..."
            class="w-full"
            @input="(e: Event) => fetchAddresses((e.target as HTMLInputElement).value)"
          />
          <div
            v-if="suggestions.length"
            class="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-lg"
          >
            <div
              v-for="s in suggestions"
              :key="s.value"
              class="p-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer
                border-b border-neutral-100 dark:border-neutral-800 last:border-0
                text-neutral-700 dark:text-neutral-300"
              @click="selectSuggestion(s)"
            >
              {{ s.value }}
            </div>
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Получатель</label>
          <UInput
            v-model="form.recipient"
            size="xl"
            placeholder="Иванов Иван Иванович"
            class="w-full"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { DaDataSuggestion } from '~/types'
import { useCheckoutStore } from '../../store'

const { form } = useCheckoutStore()
const { suggestions, fetchAddresses } = useDaDataAddress()

const addressQuery = ref(form.address)

function selectSuggestion(s: DaDataSuggestion) {
  addressQuery.value = s.value
  form.address = s.value
  form.region = s.data.region ?? s.data.city ?? ''
  form.city = s.data.city ?? s.data.settlement ?? s.data.region ?? ''
  suggestions.value = []
}
</script>
