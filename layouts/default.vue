<template>
  <UApp>
    <div class="flex min-h-screen flex-col dark:bg-neutral-900">
      <AppHeader />

      <slot />
      <AppFooter />
    </div>
  </UApp>
</template>

<script setup lang="ts"></script>
