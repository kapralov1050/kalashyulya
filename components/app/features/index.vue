<template>
  <section
    id="features"
    class="flex flex-col gap-y-8 bg-gray-50 py-8 sm:gap-y-12 sm:py-16
      dark:bg-gray-700"
  >
    <AppSectionHeader
      :heading="$t('mainpage.featuresTitle')"
      :subheading="$t('mainpage.featuresDescription')"
    />
    <AppFeaturesContent />
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
