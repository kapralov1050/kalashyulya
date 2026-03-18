<template>
  <div class="success-page">
    <SuccessOrder />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// Если есть orderId в query, можно добавить логику для проверки статуса заказа
const orderId = route.query.orderId as string
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
