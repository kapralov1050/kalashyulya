<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center sm:justify-between
      space-y-2 sm:space-y-0"
  >
    <!-- Copyright -->
    <div class="text-center sm:text-left">
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        © 2025 {{ printLocale('footer_copyright') }}
      </p>
    </div>

    <!-- Additional info -->
    <div
      class="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0
        sm:space-x-4 text-center sm:text-right"
    >
      <p class="text-xs text-neutral-400 dark:text-neutral-500">
        {{ printLocale('footer_sideDesc') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  const { printLocale } = useLocales()
</script>

<style scoped lang="scss"></style>
