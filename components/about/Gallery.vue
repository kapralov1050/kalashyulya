<template>
  <section class="w-full">
    <div class="text-center mb-8">
      <h2
        class="text-2xl md:text-3xl font-light text-gray-800
          dark:text-neutral-100 mb-3"
      >
        {{ printLocale('about_gallery_title') }}
      </h2>
      <p
        class="text-sm md:text-base text-gray-500 dark:text-neutral-300 max-w-md
          mx-auto"
      >
        {{ printLocale('about_gallery_subtitle') }}
      </p>
    </div>

    <UCarousel
      v-slot="{ item }"
      auto-scroll
      wheel-gestures
      loop
      :items="shopStore.allProducts"
      :ui="{ item: 'basis-1/1 sm:basis-1/2 lg:basis-1/3' }"
    >
      <FlipCard
        :title="item.title"
        :description="item.description"
        :image="item.image[0]"
      />
    </UCarousel>
  </section>
</template>

<script setup lang="ts">
  const shopStore = useShopStore()
  const { printLocale } = useLocales()
</script>
