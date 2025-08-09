<template>
  <section
    id="features"
    class="flex flex-col gap-y-8 py-8 sm:gap-y-12 sm:py-16"
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
