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

        <div class="mb-2 flex items-center justify-between gap-3">
          <h2
            class="text-xl font-semibold leading-snug text-gray-800
              dark:text-gray-100"
          >
            {{ product.title }}
          </h2>

          <!-- Sold Badge (inline with title) -->
          <div
            v-if="product.stock === 0 && product.isReserved"
            class="reservation-badge flex items-center space-x-1.5 bg-gray-500
              text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm
              cursor-pointer shrink-0"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ printLocale('shop_item_sold') }}</span>
          </div>
        </div>
      </header>

      <footer class="mt-5 relative flex items-center gap-3">
        <!-- Reservation Badge -->
        <div
          v-if="product.stock > 0 && product.isReserved"
          class="reservation-badge absolute -top-3.5 right-0 flex items-center
            space-x-1.5 bg-amber-500 text-white px-4 py-1.5 rounded-full text-xs
            font-medium shadow-sm cursor-pointer"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ printLocale('shop_item_reserved_badge') }}</span>
        </div>

        <h3
          v-else-if="product.stock > 0"
          class="text-lg font-semibold dark:text-white"
        >
          {{ product.price }} ₽
        </h3>

        <template v-if="product.stock > 0">
          <UButton
            :color="isInBasket ? 'success' : 'secondary'"
            size="sm"
            class="transition-all"
            @click="handleBuy"
          >
            {{
              isInBasket
                ? printLocale('shop_item_in_basket')
                : printLocale('shop_item_buy')
            }}
          </UButton>

          <UButton
            :color="isInBasket ? 'success' : 'secondary'"
            size="sm"
            icon="heroicons:shopping-cart"
            variant="ghost"
            class="transition-all"
            @click="handleAddToBasket"
          />
        </template>
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

  const { printLocale } = useLocales()

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
        id: props.product.id,
      },
      hash: route.hash,
    })
  }

  function handleAddToBasket() {
    metrics.trackButtonClick('addToBasket')
    emit('addToBasket', props.product)
  }

  function handleBuy() {
    metrics.trackButtonClick('buyButton')

    if (props.isInBasket) {
      router.push('/basket')
    } else {
      emit('buy', props.product)
    }
  }
</script>

<style scoped>
  .reservation-badge {
    transition: transform 0.3s ease;
  }

  .reservation-badge:hover {
    animation: wiggle 0.5s ease-in-out;
  }

  @keyframes wiggle {
    0%,
    100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-8deg);
    }
    75% {
      transform: rotate(8deg);
    }
  }
</style>
