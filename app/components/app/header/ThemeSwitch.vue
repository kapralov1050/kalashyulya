<template>
  <UButton
    color="neutral"
    variant="ghost"
    size="lg"
    square
    :icon="isDark ? 'heroicons:sun' : 'heroicons:moon'"
    :aria-label="isDark ? 'Включить светлую тему' : 'Включить тёмную тему'"
    class="p-2.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300
      dark:hover:text-white"
    @click="mode = isDark ? 'light' : 'dark'"
  />
</template>

<script setup lang="ts">
  import { useColorMode } from '@vueuse/core'

  const mode = useColorMode()

  const isDark = computed(() => mode.value === 'dark')
</script>
