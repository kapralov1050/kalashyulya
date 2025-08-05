<template>
  <div>
    <AppHero />
    <AppFeatures />
    <!-- <AppNewsletter /> -->
  </div>
</template>

<script setup lang="ts">
  onMounted(() => {
    scrollTo(0, 0)
  })
</script>

<style scoped></style>
