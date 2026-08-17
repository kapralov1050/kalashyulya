<template>
  <label class="flex items-start gap-3 cursor-pointer select-none">
    <UCheckbox
      :model-value="modelValue"
      :required="required"
      class="mt-0.5"
      @update:model-value="onChange"
    />
    <span class="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
      Я согласен(на) с
      <NuxtLink
        to="/privacy"
        class="text-primary-500 hover:underline"
        target="_blank"
      >
        Политикой обработки персональных данных
      </NuxtLink>
      и даю согласие на обработку моих персональных данных в целях оформления
      и доставки заказа.
    </span>
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  required?: boolean
}

withDefaults(defineProps<Props>(), {
  required: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function onChange(value: unknown) {
  emit('update:modelValue', value === true)
}
</script>
