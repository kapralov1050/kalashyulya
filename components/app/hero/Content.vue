<template>
  <div
    class="flex flex-col items-center justify-start text-center dark:text-white"
  >
    <h1 class="text-3xl font-black tracking-tight">
      <slot name="subtitle" />
      <br />
      <span
        class="bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text
          text-transparent dark:from-primary-300 dark:to-secondary-300"
      >
        <slot name="title" />
      </span>
    </h1>
    <p class="mt-2 text-gray-600 sm:mt-4 sm:text-lg dark:text-gray-200">
      <slot name="description" />
    </p>
    <div class="mt-3 flex gap-x-2">
      <slot name="buttons" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
