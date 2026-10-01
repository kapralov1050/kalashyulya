<template>
  <UButton
    to="/basket"
    color="neutral"
    variant="ghost"
    size="lg"
    square
    :aria-label="label"
    class="relative p-2.5 text-neutral-600 hover:text-neutral-900
      dark:text-neutral-300 dark:hover:text-white"
  >
    <UIcon name="heroicons:shopping-cart" class="size-5" />
    <span
      v-if="totalPurchaceQty > 0"
      aria-hidden="true"
      class="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center
        justify-center rounded-full bg-neutral-900 px-1 text-xs font-semibold
        tabular-nums text-white dark:bg-white dark:text-neutral-900"
    >
      {{ totalPurchaceQty }}
    </span>
  </UButton>
</template>

<script setup lang="ts">
  import { pluralize } from '~/utils/pluralize'

  const { totalPurchaceQty } = storeToRefs(useBasketStore())

  const label = computed(() =>
    totalPurchaceQty.value > 0
      ? `Корзина, ${pluralize(totalPurchaceQty.value, 'products')}`
      : 'Корзина',
  )
</script>
