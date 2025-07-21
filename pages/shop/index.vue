<template>
  <ShopHero />
  <Suspense>
    <ShopList
      v-if="shopStore.searchedProducts"
      :list="shopStore.searchedProducts"
    />
    <ShopList v-else :list="shopStore.allProducts" />
    <template #fallback>Загрузка... формы</template>
  </Suspense>
</template>

<script setup lang="ts">
  const shopStore = useShopStore()
</script>

<style scoped lang="scss"></style>
