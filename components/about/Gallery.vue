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
          :src="item.image"
          class="w-150 h-100 object-cover rounded-2xl border-2 border-gray-200
            shadow-sm"
        />
        <div
          class="text-center mt-3 px-4 py-2 bg-primary-600 dark:bg-gray-200
            rounded-xl text-sm text-gray-100 dark:text-gray-900 font-medium"
        >
          {{ item.title }}
        </div>
      </div>
    </UCarousel>
  </section>
</template>

<script setup lang="ts">
  const shopStore = useShopStore()
</script>
