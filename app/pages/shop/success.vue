<template>
  <div class="success-page">
    <div class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">{{ printLocale('shop_success_redirect') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { printLocale } = useLocales()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  const paymentId =
    (route.query.paymentId as string) ||
    localStorage.getItem('pendingPaymentId') ||
    ''

  if (paymentId) {
    router.push({ path: '/shop/payment-success', query: { paymentId } })
  } else {
    router.push('/shop')
  }
})
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #4ecdc4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
  max-width: 400px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .loading-text {
    font-size: 16px;
    padding: 0 20px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border-width: 3px;
  }
}

@media (max-width: 480px) {
  .loading-text {
    font-size: 14px;
  }
}
</style>
