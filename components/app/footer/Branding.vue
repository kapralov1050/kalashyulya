<template>
  <div class="flex flex-col space-y-4">
    <p
      class="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed
        max-w-md"
    >
      {{ printLocale('footer_description') }}
    </p>
  </div>
</template>

<script setup lang="ts">
  const { printLocale } = useLocales()
</script>

<style scoped lang="scss"></style>
