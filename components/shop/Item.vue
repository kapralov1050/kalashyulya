<template>
  <article
    class="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4
      shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
      dark:border-neutral-700 dark:bg-neutral-800/60
      dark:hover:border-primary-400/60 sm:p-6"
  >
    <UButton
      variant="link"
      class="block overflow-hidden rounded-xl"
      @click="openProductPage"
    >
      <img
        :src="product.image[0] || '/default-shop-image.png'"
        class="aspect-[4/3] w-full rounded-xl object-cover transition-all
          duration-300 group-hover:scale-[1.03]"
      />
    </UButton>

    <section class="mt-auto">
      <header class="mt-3">
        <div class="mb-3 flex flex-wrap gap-2">
          <div
            v-for="tag in product.tags"
            :key="tag"
            class="cursor-pointer select-none rounded-full border
              border-primary-500 bg-primary-50 px-2.5 py-1 text-xs font-medium
              text-primary-700 transition-colors duration-200
              hover:bg-primary-100 dark:border-primary-400/70
              dark:bg-primary-400/10 dark:text-primary-300
              dark:hover:bg-primary-400/20"
            @click="emit('filterByTag', tag)"
          >
            {{ tag }}
          </div>
        </div>

        <h2
          class="mb-2 text-xl font-semibold leading-snug text-gray-800
            dark:text-gray-100"
        >
          {{ product.title }}
        </h2>
      </header>

      <footer class="mt-5 flex items-center gap-3">
        <h3 class="text-lg font-semibold dark:text-white">
          {{ product.price }} ₽
        </h3>

        <UButton
          :color="isInBasket ? 'success' : 'secondary'"
          size="sm"
          class="transition-all"
          @click="emit('buy', product)"
        >
          {{ isInBasket ? 'В корзине' : 'Купить' }}
        </UButton>

        <UButton
          :color="isInBasket ? 'success' : 'secondary'"
          size="sm"
          icon="heroicons:shopping-cart"
          variant="ghost"
          class="transition-all"
          @click="emit('addToBasket', product)"
        />
      </footer>
    </section>
  </article>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import type { Product } from '~/types'

  const props = defineProps<{
    product: Product
    isInBasket: boolean
  }>()

  const emit = defineEmits<{
    addToBasket: [product: Product]
    buy: [product: Product]
    filterByTag: [tag: string]
    openModal: [product: Product]
  }>()

  const router = useRouter()
  const route = useRoute()

  function openProductPage() {
    metrics.trackButtonClick('productExtendedButton')
    router.push({
      query: {
        ...route.query,
        productModal: props.product.id,
      },
      hash: route.hash,
    })
  }
</script>

<style scoped></style>
