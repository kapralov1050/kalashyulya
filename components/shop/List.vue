<template>
  <div class="container flex justify-center mb-5">
    <section
      class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 min-w-full"
    >
      <template v-if="isLoading">
        <div
          v-for="n in 3"
          :key="`skeleton-${n}`"
          class="h-[420px] w-full rounded-2xl border border-gray-200 bg-white
            p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/60
            animate-pulse"
        >
          <div class="space-y-3">
            <USkeleton class="h-[200px] w-full rounded-xl" />
            <USkeleton class="h-4 w-3/4" />
            <div class="space-y-2">
              <USkeleton class="h-3 w-full" />
              <USkeleton class="h-3 w-2/3" />
            </div>
            <USkeleton class="h-10 w-full rounded-lg" />
          </div>
        </div>
      </template>

      <template v-else-if="false">
        <UAlert
          title="Ошибка загрузки товаров"
          :description="errorMessage"
          icon="i-heroicons-exclamation-triangle"
          color="error"
          variant="solid"
          class="col-span-full"
        />
      </template>

      <template v-else>
        <ShopItem
          v-for="item in list"
          :key="item.id"
          :product="item"
          :is-in-basket="checkStatus(item)"
          @buy="buyNow"
          @add-to-basket="addToBasket"
          @filter-by-tag="handleTagCLick"
        />
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { useFirebase } from '~/composables/firebase/useFirebase'
  import type { Product } from '~/types'

  const { list } = defineProps<{ list: Product[] }>()
  const router = useRouter()

  const basketStore = useBasketStore()
  const { addShopItemToBasket } = useBasketStore()

  const shopStore = useShopStore()
  const { filterProductsByTag } = shopStore
  const { searchedProducts, shopData } = storeToRefs(shopStore)
  const { isLoading } = useFirebase()

  const error = computed(() => {
    if (shopData.value instanceof Error) {
      return shopData.value
    }
    if (!shopData || Object.keys(shopData).length === 0) {
      return new Error('Данные не загружены')
    }
    return null
  })

  const errorMessage = computed(() => {
    if (!error.value) return ''
    return (
      error.value.message ||
      'Не удалось загрузить товары из магазина. Пожалуйста, попробуйте позже.'
    )
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
    router.push('/basket')
  }

  function handleTagCLick(tag: string) {
    searchedProducts.value = filterProductsByTag(tag)
  }
</script>
