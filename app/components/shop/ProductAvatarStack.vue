<template>
  <div class="flex items-center" :class="{ '-space-x-5': displayItems.length > 1 }">
    <img
      v-for="(it, i) in displayItems"
      :key="i"
      :src="it.src"
      :alt="it.alt ?? ''"
      class="rounded-full object-cover ring-4 ring-white dark:ring-neutral-900 shadow-xl shrink-0"
      :class="displayItems.length > 1 ? 'w-16 h-16' : 'w-24 h-24'"
    />
    <div
      v-if="extraCount > 0"
      class="w-16 h-16 rounded-full ring-4 ring-white dark:ring-neutral-900 shadow-xl shrink-0 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-sm font-semibold text-neutral-600 dark:text-neutral-300"
    >
      +{{ extraCount }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    items: { src: string; alt?: string }[]
    max?: number
  }>(),
  {
    max: 4,
  },
)

const displayItems = computed(() => props.items.slice(0, props.max))
const extraCount = computed(() => Math.max(props.items.length - props.max, 0))
</script>
