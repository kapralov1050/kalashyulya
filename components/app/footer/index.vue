<template>
  <footer
    class="mt-auto bg-primary-600 py-6 pt-8 sm:pt-10 sm:pb-8
      dark:bg-primary-900"
  >
    <div class="container flex flex-col gap-y-6 sm:gap-y-8">
      <div class="flex flex-col gap-10 lg:flex-row lg:gap-8">
        <AppFooterBranding />
        <AppFooterLists />
      </div>
      <AppFooterCopyright />
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
