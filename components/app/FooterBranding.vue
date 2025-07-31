<template>
  <div class="mr-auto flex flex-col items-start lg:max-w-80">
    <AppLogo class="text-2xl text-white" icon-classes="size-12">
      {{ $t('footer.logoName') }}
    </AppLogo>
    <p
      class="mt-2 text-sm text-indigo-200 sm:mt-4 sm:text-base
        dark:text-gray-400"
    >
      {{ $t('footer.description') }}
    </p>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
