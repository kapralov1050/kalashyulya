<template>
  <div class="flex flex-col gap-y-1">
    <AppLabel v-if="label" :for="id">
      {{ label }}
    </AppLabel>
    <UTextarea
      v-if="type === 'textarea'"
      :id="id"
      v-model="modelValue"
      :placeholder="placeholder"
      size="lg"
      class="w-full"
    />

    <UInput
      v-else
      :id="id"
      v-model="modelValue"
      :type="type"
      :placeholder="placeholder"
      size="lg"
      class="w-full"
    >
      <template v-if="modelValue?.length" #trailing>
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          icon="i-lucide-circle-x"
          aria-label="Clear input"
          @click="modelValue = ''"
        />
      </template>
    </UInput>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ inheritAttrs: false })

  interface Props {
    id?: string
    type?: string
    placeholder?: string
    label?: string
  }

  withDefaults(defineProps<Props>(), {
    type: 'text',
  })

  const modelValue = defineModel<string>({ required: true })
</script>
