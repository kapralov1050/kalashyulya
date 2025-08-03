<template>
  <AppHero />
  <AppFeatures />
  <AppNewsletter />
</template>

<script setup lang="ts">
  onMounted(() => {
    scrollTo(0, 0)
  })
</script>

<style scoped lang="scss"></style>
