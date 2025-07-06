<template>
  <div
    class="flex flex-col items-center justify-center text-center lg:items-start
      lg:text-left dark:text-white"
  >
    <h1 class="text-3xl font-black tracking-tight sm:text-5xl">
      {{ $t('mainpage.heroTitleAqua') }}
      <br />
      <span
        class="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text
          text-transparent dark:from-purple-300 dark:to-indigo-300"
      >
        {{ $t('mainpage.heroTitleAutor') }}
      </span>
    </h1>
    <p class="mt-2 text-gray-600 sm:mt-4 sm:text-lg dark:text-gray-200">
      {{ $t('mainpage.heroDescription') }}
    </p>
    <div class="mt-6 flex gap-x-2 sm:mt-8">
      <AppButton icon="heroicons:paper-airplane" lg to="/playlists">
        {{ $t('mainpage.heroMainButton') }}
      </AppButton>
      <AppButton icon="heroicons:paper-airplane" lg secondary to="#features">
        {{ $t('mainpage.heroDetailsButton') }}
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
