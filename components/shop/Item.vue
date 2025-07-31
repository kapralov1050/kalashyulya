<template>
  <NuxtLink>
    <article
      class="flex h-full flex-col dark:text-white text-gray-700 rounded-md
        border border-gray-200 p-4 hover:border-indigo-600 sm:rounded-xl sm:p-6
        dark:border-black dark:bg-gray-700 dark:hover:border-indigo-400"
    >
      <img :src="product.image" class="aspect-square object-cover" />
      <section class="mt-auto">
        <header class="mt-2">
          <p class="mt-2 mb-1 text-xs">{{ product.category }}</p>
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
