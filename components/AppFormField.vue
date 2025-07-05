<template>
  <div class="flex flex-col gap-y-1">
    <AppLabel v-if="$slots.default" :for="id">
      <slot />
    </AppLabel>
    <AppInput v-bind="$attrs" :id="id" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({ inheritAttrs: false })
  defineProps<{ id: string }>()
</script>

<style scoped lang="scss"></style>
