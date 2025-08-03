<template>
  <header
    class="sticky top-0 inset-x-0 z-10 border-b border-gray-200 bg-white py-1.5
      sm:border-0 sm:py-4 dark:border-0 dark:bg-gray-900"
  >
    <div class="container flex items-center justify-between gap-x-10">
      <AppLogo
        class="text-xl sm:text-2xl"
        icon-classes="size-8 sm:size-12 dark:text-white text-primary"
      >
        {{ $t('header.logoName') }}
      </AppLogo>
      <AppHeaderNav />
      <AppHeaderMobileNav />
    </div>
  </header>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
