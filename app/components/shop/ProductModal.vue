<template>
  <UModal
    v-if="selectedProduct"
    v-model:open="isOpen"
    :title="selectedProduct.title"
    :description="description"
    :fullscreen="isPhone"
    :ui="{
      overlay: 'bg-neutral-950/60',
      content: 'divide-y-0 sm:max-w-6xl',
    }"
  >
    <template #content>
      <UButton
        icon="heroicons:x-mark"
        color="neutral"
        variant="ghost"
        size="lg"
        square
        aria-label="Закрыть"
        class="absolute right-3 top-3 z-10 bg-white p-2.5 text-neutral-600
          hover:bg-neutral-100 hover:text-neutral-900 dark:bg-neutral-900
          dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
        @click="emit('close')"
      />
      <div data-lenis-prevent class="min-h-0 flex-1 overflow-y-auto">
        <ShopItemExtended :product="selectedProduct" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { getProductTypeLabel } from '~/constants/products'
  import type { Product } from '~/types'

  const props = defineProps<{
    selectedProduct: Product | null
    isProductModalOpen: boolean
  }>()

  const emit = defineEmits<{
    close: []
  }>()

  const { printLocale } = useLocales()

  const isOpen = computed({
    get: () => props.isProductModalOpen,
    set: () => emit('close'),
  })

  const isPhone = useMediaQuery('(max-width: 639px)')

  const description = computed(() => {
    const typeLabel = props.selectedProduct
      ? getProductTypeLabel(props.selectedProduct.categoryId)
      : ''
    return typeLabel
      ? `${typeLabel} ${printLocale('shop_item_author')}`
      : printLocale('shop_item_author')
  })
</script>
