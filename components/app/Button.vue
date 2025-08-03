<template>
  <NuxtLink v-if="$attrs.to" :to="$attrs.to" :class="classes">
    <slot />
  </NuxtLink>
  <button v-else :class="classes">
    <slot />
    <UIcon name="heroicons:paper-airplane" class="size-5 sm:hidden" />
  </button>
</template>

<script setup lang="ts">
  const { lg = false, secondary = false } = defineProps<{
    lg?: boolean
    secondary?: boolean
  }>()

  const classes = [
    'cursor-pointer rounded-md font-semibold sm:rounded-lg',
    {
      'bg-indigo-600 text-indigo-50 hover:bg-indigo-700': !secondary,
      'bg-gray-100 text-gray-900 hover:bg-gray-200': secondary,
    },
    {
      'px-4 py-1 sm:px-6 sm:py-2 text-sm sm:text-base': !lg,
      'px-6 py-2 sm:px-8 sm:py-3 sm:text-lg': lg,
    },
  ]
</script>

<style scoped lang="scss"></style>
