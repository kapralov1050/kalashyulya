<template>
  <div
    class="flex flex-col items-center justify-center text-center lg:items-start
      lg:text-left dark:text-white"
  >
    <h1 class="text-3xl font-black tracking-tight sm:text-5xl">
      {{ printLocale('mainpage_heroTitleAqua') }}
      <br />
      <span
        class="bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text
          text-transparent dark:from-primary-300 dark:to-secondary-300"
      >
        {{ printLocale('mainpage_heroTitleAutor') }}
      </span>
    </h1>
    <p class="mt-2 text-gray-600 sm:mt-4 sm:text-lg dark:text-gray-200">
      {{ printLocale('mainpage_heroDescription') }}
    </p>
    <div class="mt-6 flex gap-x-2 sm:mt-8">
      <UButton
        icon="heroicons:paper-airplane"
        to="/playlists"
        size="xl"
        variant="outline"
      >
        {{ printLocale('mainpage_heroMainButton') }}
      </UButton>
      <UButton
        icon="heroicons:paper-airplane"
        to="#features"
        size="xl"
        variant="outline"
      >
        {{ printLocale('mainpage_heroDetailsButton') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  const { printLocale } = useLocales()
</script>

<style scoped lang="scss"></style>
