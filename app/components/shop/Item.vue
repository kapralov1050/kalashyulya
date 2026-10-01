<template>
  <article class="flex flex-col">
    <NuxtLink
      :to="{ query: { ...route.query, id: String(product.id) }, hash: route.hash }"
      class="group block rounded-sm focus-visible:outline-2
        focus-visible:outline-offset-4 focus-visible:outline-neutral-900
        dark:focus-visible:outline-white"
      @click="trackClick('productExtendedButton')"
    >
      <div class="sm:flex sm:aspect-[4/3] sm:items-end">
        <img
          :src="product.image[0] || '/default-shop-image.png'"
          alt=""
          loading="lazy"
          decoding="async"
          :style="{ aspectRatio }"
          class="h-auto w-full max-w-full bg-neutral-100 object-contain
            shadow-[0_1px_2px_rgb(0_0_0/0.08),0_14px_28px_-18px_rgb(0_0_0/0.4)]
            dark:bg-neutral-800 dark:shadow-none sm:max-h-full"
          :class="{ 'sm:h-full sm:w-auto': !isWide }"
        />
      </div>

      <h2
        class="mt-4 text-base font-medium text-neutral-900 decoration-neutral-400
          underline-offset-4 group-hover:underline dark:text-white"
      >
        {{ product.title }}
      </h2>
      <p v-if="details" class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {{ details }}
      </p>
    </NuxtLink>

    <div class="mt-3 flex min-h-9 flex-wrap items-center gap-x-5 gap-y-2">
      <p
        class="tabular-nums"
        :class="
          isAvailable
            ? 'text-base font-medium text-neutral-900 dark:text-white'
            : 'text-sm text-neutral-500 dark:text-neutral-400'
        "
      >
        {{ availability }}
      </p>

      <ShopBuyButton v-if="isAvailable" :product="product" />
    </div>
  </article>
</template>

<script setup lang="ts">
  import ShopBuyButton from '~/components/shop/BuyButton.vue'
  import type { Product } from '~/types'
  import {
    formatPrice,
    formatProductDetails,
    getArtworkAspectRatio,
    parseProductSize,
  } from '~/utils/productFormat'

  const props = defineProps<{
    product: Product
  }>()

  const route = useRoute()
  const { printLocale } = useLocales()

  const aspectRatio = computed(() => getArtworkAspectRatio(props.product.size))

  const isWide = computed(() => {
    const size = parseProductSize(props.product.size)
    return !size || size.width / size.height >= 4 / 3
  })

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

  const trackClick = (name: string) => metrics.trackButtonClick(name)
</script>
