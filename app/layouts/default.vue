<template>
  <UApp>
    <div class="flex min-h-screen flex-col dark:bg-neutral-900">
      <AppHeader class="z-10" />

      <slot />
      <AppFooter />
    </div>
  </UApp>
</template>

<script setup lang="ts"></script>
