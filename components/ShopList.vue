<template>
  <div class="container flex justify-center mb-5">
    <section class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <ShopItem
        v-for="item in list"
        :key="item.id"
        :product="item"
        :is-in-basket="checkStatus(item)"
        @buy="buyNow"
        @add-to-basket="addToBasket"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
  import type { Product } from '~/types'

  const { list } = defineProps<{ list: Product[] }>()
  const router = useRouter()

  const basketStore = useBasketStore()
  const { addShopItemToBasket } = useBasketStore()

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
</script>

<style scoped lang="scss"></style>
