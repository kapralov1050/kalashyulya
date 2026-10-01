<template>
  <section class="container">
    <header class="mb-8 sm:mb-10">
      <h2
        class="text-2xl font-semibold tracking-[-0.01em] text-neutral-900
          dark:text-white sm:text-3xl"
      >
        Представленные акварели
      </h2>
      <p
        v-if="status === 'ongoing'"
        class="mt-2 text-[0.9375rem] text-neutral-600 dark:text-neutral-300"
      >
        Их можно купить после завершения выставки
      </p>
    </header>

    <ProductModal
      :selected-product="selectedProduct"
      :is-product-modal-open="isProductModalOpen"
      @close="closeModal"
    />

    <div
      v-if="filteredProducts.length"
      class="columns-1 gap-x-8 sm:columns-2 lg:columns-3 lg:gap-x-12"
    >
      <ExhibitionArtwork
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        class="mb-12 break-inside-avoid"
      />
    </div>

    <div
      v-else
      class="flex min-h-[200px] items-center justify-center rounded-2xl
        bg-neutral-50 dark:bg-neutral-900/80"
    >
      <p class="text-neutral-600 dark:text-neutral-300">
        Работы для этой выставки пока не добавлены.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
  import ExhibitionArtwork from '~/components/exhibitions/ExhibitionArtwork.vue'
  import ProductModal from '~/components/shop/ProductModal.vue'
  import { useProductModal } from '~/composables/useProductModal'
  import type { ExhibitionStatus, ExhibitionWork, Product } from '~/types'

  const props = defineProps<{
    works: ExhibitionWork[]
    status: ExhibitionStatus
  }>()

  const shopStore = useShopStore()

  const filteredProducts = computed<Product[]>(() => {
    if (!props.works || props.works.length === 0) return []

    const workTitles = props.works.map(work => work.title.toLowerCase().trim())

    return shopStore.allProducts.filter(product => {
      const productTitle = product.title.toLowerCase().trim()
      return workTitles.some(workTitle => productTitle === workTitle)
    })
  })

  const { isProductModalOpen, selectedProduct, closeModal } = useProductModal(
    computed(() => filteredProducts.value),
  )
</script>
