<template>
  <div class="flex items-center justify-between gap-x-4">
    <h3 class="font-semibold sm:text-lg dark:text-white">Lessons</h3>
    <div class="flex gap-x-2">
      <NuxtLink
        v-for="link in links"
        :key="link.icon"
        :to="link.to"
        target="_blank"
        class="hover:text-indigo-600"
      >
        <icon :name="link.icon" class="size-6 sm:size-8 dark:text-white" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  const links = [
    {
      to: '/',
      icon: 'heroicons:globe-alt-solid',
    },
    {
      to: '/',
      icon: 'heroicons:code-bracket-solid',
    },
  ]
</script>

<style scoped lang="scss"></style>
