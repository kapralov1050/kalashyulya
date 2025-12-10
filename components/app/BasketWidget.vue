<template>
  <div class="flex">
    <UIcon name="heroicons:shopping-cart" size="2rem" />
    <div
      v-if="totalPurchaceQty > 0"
      class="flex justify-center items-center rounded-full bg-primary-500
        size-5"
    >
      <span class="font-bold text-white">
        {{ totalPurchaceQty }}
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
  const { totalPurchaceQty } = storeToRefs(useBasketStore())
</script>
