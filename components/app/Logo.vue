<template>
  <NuxtLink
    to="/"
    class="inline-flex items-center gap-x-1 font-black sm:gap-x-2 dark:text-white cursor-pointer"
  >
    <img src="/logo2.png" class="h-18 w-auto dark:invert" />
    <span v-if="$slots.default">
      <slot />
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
  defineProps<{ iconClasses: string }>()
</script>

<style scoped lang="scss"></style>
