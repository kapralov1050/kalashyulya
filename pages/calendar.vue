<template>
  <AppHero>
    <AppHeroContent>
      <template #subtitle>Авторские календари</template>
      <template #title>на 2026 год!</template>
      <template #description>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloremque nam
        nostrum quis similique quae ab? Aliquam, vel id quia beatae at assumenda
        magni itaque eveniet architecto ea nesciunt illo molestiae.
      </template>
      <template #buttons>
        <UButton
          icon="heroicons:paper-airplane"
          to="/playlists"
          size="xl"
          variant="outline"
        >
          Купить
        </UButton>
      </template>
    </AppHeroContent>
    <UCarousel v-slot="{ item }" arrows loop :items="items">
      <img :src="item" class="rounded-lg" />
    </UCarousel>
  </AppHero>
</template>

<script setup lang="ts">
  const items = ['calendar-petersburg.png', 'calendar-flowers.png']
  onMounted(() => {
    scrollTo(0, 0)
  })
</script>
