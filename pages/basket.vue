<template>
  <article
    class="container flex flex-col gap-y-2 pt-24 pb-3 sm:pt-16 sm:pb-18 lg:pt-28
      lg:pb-25"
  >
    <AppSectionHeader
      heading="Корзина покупок"
      subheading="Все ваши покупки находятся здесь"
    />
    <section
      class="flex flex-col justify-center items-center gap-y-3 :gap-y-6 mt-2
        sm:mt-4"
    >
      <div
        v-for="el in basketStore.shoppingCart"
        :key="el.item.id"
        class="min-w-200 flex flex-row justify-center gap-x-5"
      >
        <NuxtImg
          :src="el.item.image"
          :alt="el.item.title"
          width="100"
          height="100"
        />
        <div>
          <p class="text-gray-800 dark:text-gray-200">{{ el.item.category }}</p>
          <h1 class="text-2xl text-gray-900 dark:text-white">
            {{ el.item.title }}
          </h1>
          <p>В наличии {{ el.item.stock }}шт.</p>
        </div>
        <div class="ml-auto flex justify-center items-center">
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="heroicons:minus-16-solid"
            aria-label="Clear input"
            @click="decreaseAmount(el.item)"
          />
          <h2 class="text-2xl text-gray-800 dark:text-gray-200">
            {{ el.amount }}
          </h2>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="heroicons:plus-16-solid"
            aria-label="Clear input"
            @click="increaseAmount(el.item)"
          />
        </div>
        <h3
          class="flex items-center ml-2 text-2xl text-gray-800
            dark:text-gray-200"
        >
          {{ el.item.price }}₽
        </h3>
      </div>
      <section class="w-200 flex justify-end gap-x-10">
        <AppButton
          class="w-auto mb-8 sm:mb-0"
          @click="isModalOpen = !isModalOpen"
        >
          Оформить заказ
        </AppButton>
        <AppModal v-if="isModalOpen" @close="isModalOpen = false">
          <template #header>Оформление заказа</template>
          <template #default><OrderForm></OrderForm></template>
        </AppModal>
        <p>Сумма покупки {{ basketStore.totalPurchaseAmount }}₽</p>
      </section>
    </section>
  </article>
</template>

<script setup lang="ts">
  import type { PurchaseParams } from '~/types'

  const basketStore = useBasketStore()
  const isModalOpen = ref(false)

  const decreaseAmount = (purchaseItem: PurchaseParams) => {
    basketStore.changeShopItemQty(-1, purchaseItem)
  }
  const increaseAmount = (purchaseItem: PurchaseParams) => {
    basketStore.changeShopItemQty(1, purchaseItem)
  }

  onMounted(() => {
    basketStore.loadPurchase()
  })
</script>

<style scoped lang="scss"></style>
