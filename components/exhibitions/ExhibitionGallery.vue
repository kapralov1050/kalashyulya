<template>
  <section class="container mb-16">
    <header
      class="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-end
        sm:justify-between"
    >
      <div>
        <h2
          class="text-2xl font-semibold tracking-tight text-neutral-900
            dark:text-white sm:text-3xl"
        >
          Представленные акварели
        </h2>
        <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          Их можно купить после завершения выставки
        </p>
      </div>
    </header>

    <UCarousel
      v-slot="{ item }"
      :items="filteredProducts"
      :ui="{
        item: 'basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4',
      }"
      dots
      autoplay
      class="w-full"
    >
      <ShopItem
        :product="item"
        :is-in-basket="checkStatus(item)"
        @buy="buyNow"
        @add-to-basket="addToBasket"
        @filter-by-tag="() => {}"
      />
    </UCarousel>

    <div
      v-if="filteredProducts.length === 0"
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
  import ShopItem from '~/components/shop/Item.vue'
  import type { ExhibitionWork, Product } from '~/types'

  const props = defineProps<{
    works: ExhibitionWork[]
  }>()

  const shopStore = useShopStore()
  const basketStore = useBasketStore()
  const { addShopItemToBasket } = useBasketStore()

  // Фильтруем товары из магазина по совпадению title с works
  const filteredProducts = computed<Product[]>(() => {
    if (!props.works || props.works.length === 0) return []

    const workTitles = props.works.map(work => work.title.toLowerCase().trim())

    return shopStore.allProducts.filter(product => {
      const productTitle = product.title.toLowerCase().trim()
      return workTitles.some(workTitle => productTitle === workTitle)
    })
  })

  const checkStatus = (prod: Product) => {
    return basketStore.shoppingCart.some(el => el.item.id === prod.id)
  }

  const addToBasket = async (product: Product) => {
    await new Promise(resolve => {
      setTimeout(resolve, 300)
    })

    const { description, categoryId, tags, ...purchaseParams } = product

    const purchase = {
      amount: 1,
      item: purchaseParams,
    }
    addShopItemToBasket(purchase)
  }

  const buyNow = async (product: Product) => {
    addToBasket(product)
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })
    navigateTo('/basket')
  }
</script>
