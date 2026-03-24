<template>
  <UModal v-model:open="isOpen" @close="emit('close')">
    <template #content>
      <div
        class="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full
          mx-auto"
      >
        <!-- Заголовок -->
        <div class="text-center mb-6">
          <UIcon
            name="i-heroicons-shopping-cart"
            class="w-12 h-12 text-primary-500 mx-auto mb-4"
          />
          <h2
            class="text-xl font-bold mb-2 text-neutral-900
              dark:text-neutral-100"
          >
            В корзине уже есть товары
          </h2>
          <p class="text-neutral-600 dark:text-neutral-400">
            В вашей корзине {{ itemCount }} товар{{
              itemCount > 1 ? 'а' : ''
            }}
            на сумму {{ formatPrice(basketAmount) }} ₽
          </p>
        </div>

        <!-- Опции действий -->
        <div class="space-y-3">
          <UButton color="primary" size="lg" block @click="handleBuyOnly">
            <UIcon name="i-heroicons-check" class="w-5 h-5 mr-2" />
            Оформить `{{ product?.title || '' }}`
          </UButton>

          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            block
            @click="handleAddToBasket"
          >
            <UIcon name="i-heroicons-plus" class="w-5 h-5 mr-2" />
            Добавить к существующим
          </UButton>
        </div>

        <!-- Информация -->
        <div
          class="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border
            border-amber-200 dark:border-amber-800"
        >
          <p class="text-sm text-amber-800 dark:text-amber-300">
            <UIcon
              name="i-heroicons-information-circle"
              class="w-4 h-4 inline mr-1"
            />
            При выборе `{{ product?.title || '' }}` текущая корзина будет
            очищена
          </p>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import type { Product } from '~/types'

  const props = defineProps<{
    itemCount: number
    basketAmount: number
    product: Product | null
  }>()

  const isOpen = defineModel<boolean>('open', { default: false })

  const emit = defineEmits<{
    close: []
    buyOnly: []
    addToBasket: []
  }>()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price)
  }

  const handleBuyOnly = () => {
    emit('buyOnly')
  }

  const handleAddToBasket = () => {
    emit('addToBasket')
  }
</script>
