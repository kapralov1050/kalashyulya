<template>
  <section class="flex flex-col gap-y-6 py-8 sm:gap-y-8 sm:py-16">
    <AppNewsletterHeader />
    <AppSectionHeader
      :heading="$t('mainpage.emailTitle')"
      :subheading="$t('mainpage.emailDescription')"
    />
    <AppNewsletterContent />
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
