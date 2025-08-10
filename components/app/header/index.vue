<template>
  <header
    class="sticky top-0 inset-x-0 z-10 bg-white border-b border-neutral-200 py-2
      sm:border-0 sm:py-4 dark:bg-neutral-900 dark:border-b
      dark:border-neutral-700"
  >
    <div class="container flex items-center gap-x-5">
      <AppLogo
        class="text-xl sm:text-2xl"
        icon-classes="size-8 sm:size-12 dark:text-white text-primary"
      >
        {{ $t('header.logoName') }}
      </AppLogo>
      <AppHeaderThemeSwitch class="ml-auto" />
      <AppHeaderNav />
      <AppHeaderMobileNav />
    </div>
  </header>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
