<template>
  <div class="mb-20">
    <ShopHero />
    <ShopList />
  </div>
</template>

<script setup lang="ts">
  const shopStore = useShopStore()

  useSeo({
    title: 'Магазин',
    description:
      'Купить картины, открытки, стикеры и календари от художника-акварелиста Юлии Калашниковой. Авторские работы в технике акварели.',
    image: '/logo.png',
  })
</script>

<style scoped lang="scss"></style>
