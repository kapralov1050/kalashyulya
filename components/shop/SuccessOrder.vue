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
      Спасибо! Ваш заказ успешно оформлен
    </template>

    <template #description>
      В ближайшее время я свяжусь с вами способом, который вы указали в заявке
    </template>
  </AnimatedBlob>
</template>

<script setup lang="ts">
  import AnimatedBlob from './AnimatedBlob.vue'
</script>

<style scoped lang="scss"></style>
