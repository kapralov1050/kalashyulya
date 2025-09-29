<template>
  <NuxtLink>
    <article
      class="flex h-full flex-col dark:text-white text-gray-700 rounded-md
        border border-gray-200 p-4 hover:border-priimary-600 sm:rounded-xl
        sm:p-6 dark:border-black dark:bg-neutral-800
        dark:hover:border-primary-400"
    >
      <img
        :src="product.image || '/default-shop-image.png'"
        class="aspect-square object-cover"
      />
      <section class="mt-auto">
        <header class="mt-2">
          <div class="flex gap-x-2 mb-3">
            <div
              v-for="tag in product.tags"
              :key="tag"
              class="p-1 w-fit text-xs border-2 border-primary-700 rounded-md"
            >
              {{ tag }}
            </div>
          </div>
          <h2 class="mb-2 text-2xl">
            {{ product.title }}
          </h2>
        </header>
        <p class="mb-1 text-sm truncate">{{ product.description }}</p>
        <footer class="mt-10 flex justify-start align-center gap-x-4">
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
  </NuxtLink>
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
  }>()
</script>

<style scoped lang="scss"></style>
