<template>
  <footer
    class="mt-auto bg-gradient-to-br from-neutral-50 to-neutral-100
      dark:from-neutral-900 dark:to-neutral-800 border-t border-neutral-200
      dark:border-neutral-700"
  >
    <div class="container mx-auto px-6 py-12">
      <!-- Main footer content -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <!-- Branding section -->
        <div class="lg:col-span-2">
          <AppFooterBranding />
        </div>

        <!-- Links section -->
        <div class="flex justify-center md:justify-end">
          <AppFooterLinks />
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-neutral-200 dark:border-neutral-700 pt-6">
        <AppFooterCopyright />
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
