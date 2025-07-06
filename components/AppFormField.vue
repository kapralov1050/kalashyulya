<template>
  <div class="flex flex-col gap-y-1">
    <AppLabel v-if="$slots.default" :for="id">
      <slot />
    </AppLabel>
    <UInput
      v-model="searchValue"
      color="info"
      highlight
      :placeholder="placeholder"
      size="lg"
      type="text"
      class="w-100%"
    >
      <template v-if="searchValue?.length" #trailing>
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          icon="i-lucide-circle-x"
          aria-label="Clear input"
          @click="searchValue = ''"
        />
      </template>
    </UInput>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ inheritAttrs: false })

  defineProps<{ id: string; placeholder: string }>()
  const searchValue = defineModel<string>({ required: true })
</script>

<style scoped lang="scss"></style>
