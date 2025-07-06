<template>
  <div class="container flex justify-center">
    <section class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <ShopItem
        v-for="item in searchedProducts"
        :key="item.id"
        :product="item"
        @buy="buyNow"
        @add-to-basket="addToBasket"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
  import type { PurchaseParams } from '../types'

  const basketStore = useBasketStore()
  const shopStore = useShopStore()
  const router = useRouter()
  const { searchedProducts, products } = storeToRefs(shopStore)

  const { addShopItemToBasket } = useBasketStore()

  const addToBasket = async (product: PurchaseParams) => {
    await new Promise(resolve => {
      setTimeout(resolve, 300)
    })
    addShopItemToBasket(product)
  }

  const buyNow = async (product: PurchaseParams) => {
    addShopItemToBasket(product)
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })
    router.push('/basket')
  }

  onMounted(() => {
    searchedProducts.value = products.value
    basketStore.loadPurchase()
  })
</script>

<style scoped lang="scss"></style>
