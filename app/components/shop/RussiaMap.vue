<template>
  <div class="relative w-full h-full">
    <!-- Спиннер пока данные грузятся -->
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div
        class="w-5 h-5 border-2 border-neutral-300 border-t-neutral-500
          rounded-full animate-spin"
      />
    </div>

    <svg
      v-show="!loading"
      viewBox="-65 0 1134 620"
      class="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        v-for="region in regions"
        :key="region.ident"
        class="transition-all duration-300"
        style="cursor: default"
        @mouseenter="hoveredIdent = region.ident"
        @mouseleave="hoveredIdent = null"
      >
        <path
          v-for="(d, i) in region.paths"
          :key="`p-${i}`"
          :d="d"
          :fill="getRegionColor(region.ident)"
          :fill-opacity="getRegionOpacity(region.ident)"
          stroke="#ffffff"
          stroke-width="0.8"
          stroke-linejoin="round"
        />
        <polygon
          v-for="(pts, i) in region.polygons"
          :key="`poly-${i}`"
          :points="pts"
          :fill="getRegionColor(region.ident)"
          :fill-opacity="getRegionOpacity(region.ident)"
          stroke="#ffffff"
          stroke-width="0.8"
          stroke-linejoin="round"
        />
      </g>

      <!-- Маркер Санкт-Петербурга для режима самовывоза -->
      <g v-if="mode === 'pickup'">
        <circle
          cx="130"
          cy="275"
          r="18"
          :fill="ZONE_CONFIG[1].hex"
          opacity="0.15"
        >
          <animate
            attributeName="r"
            values="10;22;10"
            dur="2.2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0;0.2"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="130" cy="275" r="7" :fill="ZONE_CONFIG[1].hex" />
        <circle cx="130" cy="275" r="3" fill="white" />
      </g>
    </svg>

    <!-- Тултип при наведении (режим доставки) -->
    <Transition name="fade">
      <div
        v-if="hoveredRegion && mode === 'delivery'"
        class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2
          px-3 py-1.5 rounded-lg bg-neutral-900/85 backdrop-blur-sm text-xs
          text-white font-medium whitespace-nowrap"
      >
        {{ hoveredRegion.name }}
        <span v-if="hoveredZone" class="ml-2 opacity-70">
          · {{ ZONE_CONFIG[hoveredZone].name }}
        </span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import {
    IDENT_ZONE,
    ZONE_CONFIG,
    type DeliveryZone,
  } from '~/composables/useDeliveryZone'
  import { useRussiaMap } from '~/composables/useRussiaMap'

  const props = defineProps<{
    mode: 'pickup' | 'delivery'
    activeZone?: DeliveryZone | null
  }>()

  const { regions, loading, loadRegions } = useRussiaMap()
  const hoveredIdent = ref<string | null>(null)

  onMounted(loadRegions)

  const hoveredRegion = computed(() =>
    hoveredIdent.value
      ? (regions.value.find(r => r.ident === hoveredIdent.value) ?? null)
      : null,
  )

  const hoveredZone = computed<DeliveryZone | null>(() =>
    hoveredIdent.value ? (IDENT_ZONE[hoveredIdent.value] ?? null) : null,
  )

  const GREEN = ZONE_CONFIG[1].hex

  function getRegionColor(ident: string): string {
    if (props.mode === 'pickup') {
      return ident === '47' ? GREEN : '#d1d5db'
    }
    const zone = IDENT_ZONE[ident] as DeliveryZone | undefined
    return zone && zone === props.activeZone ? GREEN : '#d1d5db'
  }

  function getRegionOpacity(ident: string): number {
    if (props.mode === 'pickup') {
      return ident === '47' ? 0.65 : 0.35
    }
    const zone = IDENT_ZONE[ident] as DeliveryZone | undefined
    if (!props.activeZone) return 0.35
    return zone === props.activeZone ? 0.7 : 0.3
  }
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
