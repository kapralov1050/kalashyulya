<template>
  <section
    v-if="works.length"
    aria-labelledby="featured-works-title"
    class="container"
  >
    <div class="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
      <h2
        id="featured-works-title"
        class="text-[1.875rem] font-semibold leading-tight tracking-[-0.01em]
          text-neutral-900 dark:text-white sm:text-4xl"
      >
        Новые работы
      </h2>
      <NuxtLink
        to="/shop"
        class="inline-flex items-center gap-1.5 rounded-sm text-[0.9375rem]
          font-medium text-neutral-900 underline decoration-neutral-300
          underline-offset-4 hover:decoration-neutral-900
          focus-visible:outline-2 focus-visible:outline-offset-4
          focus-visible:outline-neutral-900 dark:text-white
          dark:decoration-neutral-600 dark:hover:decoration-white
          dark:focus-visible:outline-white"
      >
        Все работы в магазине
        <UIcon name="heroicons:arrow-right-20-solid" class="size-4" />
      </NuxtLink>
    </div>

    <div
      class="mt-10 columns-1 gap-x-8 sm:columns-2 lg:columns-3 lg:gap-x-12"
    >
      <ExhibitionArtwork
        v-for="work in works"
        :key="work.id"
        :product="work"
        class="mb-12 break-inside-avoid"
      />
    </div>

    <ProductModal
      :selected-product="selectedProduct"
      :is-product-modal-open="isProductModalOpen"
      @close="closeModal"
    />
  </section>
</template>

<script setup lang="ts">
  import ExhibitionArtwork from '~/components/exhibitions/ExhibitionArtwork.vue'
  import ProductModal from '~/components/shop/ProductModal.vue'
  import { useProductModal } from '~/composables/useProductModal'
  import type { Product } from '~/types'
  import { selectFeaturedWorks } from '~/utils/featuredWorks'

  const shopStore = useShopStore()

  const works = computed<Product[]>(() =>
    selectFeaturedWorks(Object.values(shopStore.shopData?.products ?? {})),
  )

  const { isProductModalOpen, selectedProduct, closeModal } = useProductModal(
    works,
  )
</script>
