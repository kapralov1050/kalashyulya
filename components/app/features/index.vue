<template>
  <section
    id="features"
    class="flex flex-col gap-y-8 py-8 sm:gap-y-12 sm:py-16"
  >
    <AppSectionHeader
      :heading="printLocale('mainpage_featuresTitle')"
      :subheading="printLocale('mainpage_featuresDescription')"
    />
    <AppFeaturesContent />
  </section>
</template>

<script setup lang="ts">
  const { printLocale } = useLocales()
</script>

<style scoped lang="scss"></style>
