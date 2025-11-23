<template>
  <article
    class="flex h-full flex-col dark:text-white text-gray-700 rounded-md border
      border-gray-200 p-4 hover:border-priimary-600 sm:rounded-xl sm:p-6
      dark:border-black dark:bg-neutral-800 dark:hover:border-primary-400"
  >
    <NuxtLink :to="`/shop/${product.id}`">
      <img
        :src="product.image[0] || '/default-shop-image.png'"
        class="aspect-square object-cover"
      />
    </NuxtLink>
    <section class="mt-auto">
      <header class="mt-2">
        <div class="flex gap-x-2 mb-3">
          <div
            v-for="tag in product.tags"
            :key="tag"
            class="flex justify-center items-center px-2 py-1 text-xs
              font-medium border border-primary-500 rounded-full bg-primary-50
              dark:bg-primary-900/20 hover:bg-primary-100
              dark:hover:bg-primary-900/30 transition-colors duration-200
              cursor-pointer"
            @click="emit('filterByTag', tag)"
          >
            {{ tag }}
          </div>
        </div>
        <h2 class="mb-2 text-2xl">
          {{ product.title }}
        </h2>
      </header>

      <footer class="mt-5 flex justify-start align-center gap-x-4">
        <h3 class="text-xl">{{ product.price }}₽</h3>
        <UButton
          :color="isInBasket ? 'success' : 'secondary'"
          size="sm"
          @click="emit('buy', product)"
        >
          {{ isInBasket ? 'В корзине' : 'Купить' }}
        </UButton>
        <UButton
          :color="isInBasket ? 'success' : 'secondary'"
          size="sm"
          icon="heroicons:shopping-cart"
          variant="ghost"
          @click="emit('addToBasket', product)"
        ></UButton>
      </footer>
    </section>
  </article>
</template>

<script setup lang="ts">
  import type { Product } from '~/types'

  defineProps<{
    product: Product
    isInBasket: boolean
  }>()

  const emit = defineEmits<{
    addToBasket: [product: Product]
    buy: [product: Product]
    filterByTag: [tag: string]
  }>()
</script>

<style scoped></style>
