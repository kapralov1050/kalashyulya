<script setup lang="ts">
  import type { NuxtError } from '#app'

  defineProps({
    // eslint-disable-next-line vue/require-default-prop
    error: Object as () => NuxtError,
  })
</script>

<template>
  <div>
    <h1>{{ error?.statusCode }}</h1>
    <NuxtLink to="/">Вернуться на домашнюю страницу</NuxtLink>
  </div>
</template>
