<template>
  <NuxtLink
    :to="{ query: { ...route.query, id: String(product.id) } }"
    class="group block focus-visible:outline-2 focus-visible:outline-offset-4
      focus-visible:outline-neutral-900 dark:focus-visible:outline-white"
    @click="metrics.trackButtonClick('productExtendedButton')"
  >
    <figure>
      <img
        :src="product.image[0] || '/default-shop-image.png'"
        alt=""
        loading="lazy"
        decoding="async"
        :style="{ aspectRatio }"
        class="h-auto w-full bg-neutral-100
          shadow-[0_1px_2px_rgb(0_0_0/0.08),0_14px_28px_-18px_rgb(0_0_0/0.4)]
          dark:bg-neutral-800 dark:shadow-none"
      />

      <figcaption class="mt-4">
        <h3
          class="text-base font-medium text-neutral-900 decoration-neutral-400
            underline-offset-4 group-hover:underline dark:text-white"
        >
          {{ product.title }}
        </h3>
        <p
          v-if="details"
          class="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
        >
          {{ details }}
        </p>
        <p
          class="mt-2 tabular-nums"
          :class="
            isAvailable
              ? 'text-base font-medium text-neutral-900 dark:text-white'
              : 'text-sm text-neutral-500 dark:text-neutral-400'
          "
        >
          {{ availability }}
        </p>
      </figcaption>
    </figure>
  </NuxtLink>
</template>

<script setup lang="ts">
  import type { Product } from '~/types'
  import {
    formatPrice,
    formatProductDetails,
    getArtworkAspectRatio,
  } from '~/utils/productFormat'

  const props = defineProps<{
    product: Product
  }>()

  const route = useRoute()
  const { printLocale } = useLocales()

  const aspectRatio = computed(() => getArtworkAspectRatio(props.product.size))

  const details = computed(() => formatProductDetails(props.product))

  const isAvailable = computed(
    () => props.product.stock > 0 && !props.product.isReserved,
  )

  const availability = computed(() => {
    if (props.product.stock === 0) return printLocale('shop_item_sold')
    if (props.product.isReserved) {
      return printLocale('shop_item_reserved_badge')
    }
    return formatPrice(props.product.price)
  })
</script>
