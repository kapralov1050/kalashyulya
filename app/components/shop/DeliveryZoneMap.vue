<template>
  <div class="flex flex-col h-full gap-3">
    <!-- Карта занимает всё свободное пространство -->
    <div class="flex-1 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 min-h-0">
      <ShopRussiaMap mode="delivery" :active-zone="zone" />
    </div>

    <!-- Инфо-карточка зоны — фиксированная высота снизу -->
    <Transition name="slide-up">
      <div
        v-if="zone"
        class="shrink-0 flex items-center gap-3 px-3.5 py-3 rounded-xl border"
        :style="{
          backgroundColor: ZONE_CONFIG[zone].hex + '14',
          borderColor: ZONE_CONFIG[zone].hex + '55',
        }"
      >
        <div
          class="w-2.5 h-2.5 rounded-full shrink-0"
          :style="{ background: ZONE_CONFIG[zone].hex }"
        />
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            {{ ZONE_CONFIG[zone].name }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
            {{ cityName }}
          </p>
        </div>
        <div class="text-right shrink-0">
          <p
            v-if="ZONE_CONFIG[zone].minPrice"
            class="text-sm font-bold"
            :style="{ color: ZONE_CONFIG[zone].hex }"
          >
            от {{ ZONE_CONFIG[zone].minPrice }} ₽
          </p>
          <p v-else class="text-sm font-semibold text-red-500">уточняется</p>
          <p class="text-[10px] text-neutral-400 mt-0.5">до ПВЗ СДЭК</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ZONE_CONFIG, type DeliveryZone } from '~/composables/useDeliveryZone'

  defineProps<{
    zone: DeliveryZone | null
    cityName: string
  }>()
</script>
