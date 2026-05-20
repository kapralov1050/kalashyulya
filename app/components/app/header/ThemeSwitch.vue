<template>
  <USwitch
    v-model="isDark"
    color="neutral"
    unchecked-icon="heroicons:sun"
    checked-icon="heroicons:moon"
    size="xl"
    @click="mode = mode === 'light' ? 'dark' : 'light'"
  />
</template>

<script setup lang="ts">
  import { useColorMode } from '@vueuse/core'

  const mode = useColorMode()

  const isDark = computed(() => {
    return mode.value === 'dark'
  })
</script>

<style scoped lang="scss"></style>
