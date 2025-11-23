<template>
  <section class="w-full">
    <UCarousel
      v-slot="{ item }"
      auto-scroll
      wheel-gestures
      loop
      :items="shopStore.allProducts"
      :ui="{ item: 'basis-1/1 sm:basis-1/2 lg:basis-1/3' }"
    >
      <div class="flex flex-col items-center">
        <img
          :src="item.image[0]"
          class="w-150 h-100 object-cover rounded-2xl border-2 border-gray-200
            shadow-sm"
        />
      </div>
    </UCarousel>
  </section>
</template>

<script setup lang="ts">
  const shopStore = useShopStore()
</script>
