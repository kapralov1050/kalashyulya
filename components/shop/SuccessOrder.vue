<template>
  <AnimatedBlob>
    <template #icon>
      <!-- Минималистичная белая галочка -->
      <svg
        class="w-[80px] h-[80px] select-none"
        viewBox="0 0 52 52"
      >
        <path
          d="M14 27l7 7 17-17"
          fill="none"
          stroke="white"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </template>

    <template #heading>
      {{ printLocale('shop_success_title') }}
    </template>

    <template #description>
      {{ printLocale('shop_success_desc') }}
    </template>
  </AnimatedBlob>
</template>

<script setup lang="ts">
  import AnimatedBlob from './AnimatedBlob.vue'

  const { printLocale } = useLocales()
</script>

<style scoped lang="scss"></style>
