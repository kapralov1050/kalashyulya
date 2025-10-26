<template>
  <div class="flex flex-col space-y-4">
    <!-- Logo -->
    <div class="flex items-center space-x-3">
      <AppLogo
        class="text-2xl font-bold text-neutral-800 dark:text-white"
        icon-classes="size-10 text-primary-600 dark:text-primary-400"
      >
        {{ $t('footer.logoName') }}
      </AppLogo>
    </div>

    <!-- Description -->
    <p
      class="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed
        max-w-md"
    >
      {{ $t('footer.description') }}
    </p>

    <!-- Additional info -->
    <div
      class="flex flex-col space-y-2 text-xs text-neutral-500
        dark:text-neutral-400"
    >
      <p>Акварельные уроки и художественные работы</p>
      <p>Watercolor lessons & artistic works</p>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
