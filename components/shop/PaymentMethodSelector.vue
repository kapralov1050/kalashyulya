<template>
  <AnimatedBlob>
    <template #heading>
      Заказ успешно оформлен!
    </template>

    <template #description>
      Выберите способ оплаты:
    </template>

    <template #content>
      <div class="flex flex-col gap-4 w-full">
        <!-- Онлайн оплата ЮKassa -->
        <div class="border-2 border-primary-500 rounded-xl p-4 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors"
          @click="selectPaymentMethod('yookassa')">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-credit-card" class="w-6 h-6 text-primary-600" />
            <div class="text-left">
              <h2 class="font-semibold text-neutral-900 dark:text-neutral-200">Онлайн оплата</h2>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                Быстрая оплата банковской картой
              </p>
            </div>
          </div>
        </div>

        <!-- Оплата переводом вручную -->
        <div class="border-2 border-neutral-300 dark:border-neutral-600 rounded-xl p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          @click="selectPaymentMethod('manual')">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-chat-bubble-left-right" class="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            <div class="text-left">
              <h2 class="font-semibold text-neutral-900 dark:text-neutral-200">Оплата переводом</h2>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                С вами свяжутся для оплаты вручную
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AnimatedBlob>
</template>

<script setup lang="ts">
  import AnimatedBlob from './AnimatedBlob.vue'

  const emit = defineEmits<{
    selectPaymentMethod: [method: 'yookassa' | 'manual']
  }>()

  function selectPaymentMethod(method: 'yookassa' | 'manual') {
    emit('selectPaymentMethod', method)
  }
</script>

<style scoped lang="scss"></style>
