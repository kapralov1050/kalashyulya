<template>
  <div class="flex flex-col space-y-4">
    <!-- Description -->
    <p
      class="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed
        max-w-md"
    >
      {{ printLocale('footer_description') }}
    </p>

    <!-- Additional info -->
    <!-- <div
      class="flex flex-col space-y-2 text-xs text-neutral-500
        dark:text-neutral-400"
    >
      <p>{{ printLocale('footer_subdesc_1') }}</p>
      <p>{{ printLocale('footer_subdesc_2') }}</p>
    </div> -->
  </div>
</template>

<script setup lang="ts">
  const { printLocale } = useLocales()
</script>

<style scoped lang="scss"></style>
