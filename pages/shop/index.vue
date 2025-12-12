<template>
  <div class="mb-10 flex flex-col gap-y-10">
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

  onMounted(async () => {
    metrics.trackPageView('shop')
  })
</script>

<style scoped lang="scss"></style>
