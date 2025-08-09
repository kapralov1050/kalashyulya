<template>
  <section class="w-full">
    <UCarousel
      v-slot="{ item }"
      auto-scroll
      :items="items"
      :ui="{ item: 'basis-1/1 sm:basis-1/2 lg:basis-1/3' }"
    >
      <NuxtImg
        :src="item"
        class="w-150 h-100 object-cover rounded-2xl border-5 border-info-400"
      />
    </UCarousel>
  </section>
</template>

<script setup lang="ts">
  const items = [
    'gallery/2.jpg',
    'gallery/3.jpg',
    'gallery/4.jpg',
    'gallery/5.jpg',
    'gallery/6.jpg',
    'gallery/7.jpg',
    'gallery/8.jpg',
    'gallery/9.jpg',
    'gallery/10.jpg',
    'gallery/11.jpg',
    'gallery/12.jpg',
    'gallery/13.jpg',
    'gallery/14.jpg',
    'gallery/15.jpg',
  ]
</script>
