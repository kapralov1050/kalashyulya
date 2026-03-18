<template>
  <div v-if="confirmationUrl" class="payment-widget-wrapper">
    <div id="payment-widget-container" class="payment-widget-container"></div>
  </div>
  <div v-else class="payment-loading">
    <UIcon name="i-heroicons-arrow-path" class="animate-spin w-8 h-8" />
    <p>Загрузка платежной формы...</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  confirmationUrl: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  success: []
  error: [error: string]
}>()

const { openPaymentWidget } = useYookassaPayment()

onMounted(() => {
  openPaymentWidget(
    props.confirmationUrl,
    () => {
      emit('success')
    },
    (error: string) => {
      emit('error', error)
    },
  )
})
</script>

<style scoped>
.payment-widget-wrapper {
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-widget-container {
  width: 100%;
  max-width: 600px;
}

.payment-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 400px;
  color: #6b7280;
}
</style>
