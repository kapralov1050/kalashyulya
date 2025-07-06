<template>
  <div class="container flex justify-center">
    <section class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <ShopItem
        v-for="item in searchedProducts"
        :key="item.id"
        :product="item"
        @add-in-basket="addToBasket(item)"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
  import type { PurchaseParams } from '../types'

  const basketStore = useBasketStore()
  const shopStore = useShopStore()
  const { searchedProducts, products } = storeToRefs(shopStore)

  const { addShopItemToBasket } = useBasketStore()

  const addToBasket = (item: PurchaseParams) => {
    const purchase = {
      price: item.price,
      title: item.title,
      image: item.image,
      id: item.id,
      category: item.category,
      stock: item.stock,
    }
    addShopItemToBasket(purchase)
  }

  onMounted(() => {
    searchedProducts.value = products.value
    basketStore.loadPurchase()
  })
</script>

<style scoped lang="scss"></style>
