<template>
  <div class="flex flex-col gap-y-10 pb-16 sm:pb-24">
    <ShopHero />
    <ShopList />
  </div>
</template>

<script setup lang="ts">
  useSeo({
    title: 'Магазин',
    description:
      'Купить картины, открытки, стикеры и календари от художника-акварелиста Юлии Калашниковой. Авторские работы в технике акварели.',
    image: '/logo.png',
  })
</script>
