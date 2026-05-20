<template>
  <UModal
    v-if="selectedProduct"
    v-model:open="isOpen"
    :ui="{
      overlay: 'bg-black/50 backdrop-blur-sm',
      content: 'min-w-[80vw] max-h-[70vh] h-auto shadow-4xl',
    }"
  >
    <template #content>
      <UButton
        icon="heroicons:x-mark-16-solid"
        variant="link"
        color="neutral"
        size="lg"
        class="absolute top-4 right-4 z-10000 rounded-full text-black
          dark:text-white border-2 border-black dark:border-white
          hover:text-neutral-500 hover:border-neutral-500"
        @click="emit('close')"
      />
      <ShopItemExtended :product="selectedProduct" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import type { Product } from '~/types'

  const props = defineProps<{
    selectedProduct: Product | null
    isProductModalOpen: boolean
  }>()

  const emit = defineEmits<{
    close: []
  }>()

  const isOpen = computed({
    get: () => props.isProductModalOpen,
    set: () => emit('close'),
  })
</script>
