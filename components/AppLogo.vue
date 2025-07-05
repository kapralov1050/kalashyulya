<template>
  <NuxtLink
    to="/"
    class="flex items-center gap-x-1 font-black sm:gap-x-2 dark:text-white"
  >
    <icon name="heroicons:paint-brush" :class="`-rotate-6 ${iconClasses}`" />
    <span v-if="$slots.default">
      <slot />
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
  defineProps<{ iconClasses: string }>()
</script>

<style scoped lang="scss"></style>
