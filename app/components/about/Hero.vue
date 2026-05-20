<template>
  <section class="container mt-20 mb-20">
    <div class="flex flex-col gap-y-10 sm:flex-row sm:gap-x-15 overflow-auto">
      <img
        src="/about-hero.webp"
        alt="Юлия Калашникова"
        class="h-auto w-full sm:w-1/2 object-cover rounded-lg"
      />
      <div>
        <h2 class="text-3xl mb-10">{{ printLocale('about_hero_title') }}</h2>
        <p class="whitespace-pre-line">{{ printLocale('about_hero_text') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  const { printLocale } = useLocales()
</script>

<style scoped>
  .whitespace-pre-line {
    white-space: pre-line;
  }
</style>
