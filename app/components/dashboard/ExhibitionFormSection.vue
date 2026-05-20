<template>
  <div
    class="rounded-xl border border-gray-200 bg-gray-50/50 p-5 space-y-4"
  >
    <h3
      class="text-sm font-semibold uppercase tracking-wide text-gray-500"
    >
      {{ title }}
    </h3>
    <slot />
  </div>
</template>

<script setup lang="ts">
  defineProps<{ title: string }>()
</script>
