<script setup lang="ts">
  type ActionColor = 'primary' | 'neutral'
  type ActionVariant = 'solid' | 'outline' | 'ghost' | 'soft'

  interface Action {
    label: string
    onClick: () => void
    color?: ActionColor
    variant?: ActionVariant
    icon?: string
    loading?: boolean
    disabled?: boolean
  }

  defineProps<{
    actions: Action[]
  }>()
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-3 justify-center">
    <UButton
      v-for="(action, i) in actions"
      :key="i"
      :color="action.color ?? 'primary'"
      :variant="action.variant ?? 'solid'"
      size="lg"
      :loading="action.loading"
      :disabled="action.disabled"
      block
      @click="action.onClick"
    >
      <UIcon v-if="action.icon" :name="action.icon" class="w-5 h-5 mr-2" />
      {{ action.label }}
    </UButton>
  </div>
</template>
