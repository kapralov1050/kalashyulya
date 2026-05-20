<template>
  <div
    ref="snowContainerRef"
    class="fixed inset-0 pointer-events-none z-1002"
  />
</template>

<script setup lang="ts">
  import Snowflakes from 'magic-snowflakes'
  import { onMounted, onUnmounted, ref } from 'vue'

  const snowContainerRef = ref<HTMLElement>()
  const snowflakesInstance = ref<Snowflakes | null>(null)
  const mode = useColorMode()

  const isDark = computed(() => {
    return mode.value === 'dark'
  })

  onMounted(async () => {
    await nextTick()
    snowflakesInstance.value = new Snowflakes({
      container: snowContainerRef.value!,
      color: isDark.value ? 'white' : '#cccccc',
      count: 100,
      speed: 1.5,
      autoResize: true,
    })
  })

  onUnmounted(() => {
    if (snowflakesInstance.value) {
      snowflakesInstance.value.destroy()
    }
  })
</script>
