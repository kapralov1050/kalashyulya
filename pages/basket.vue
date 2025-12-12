<template>
  <article
    class="flex justify-center pt-24 pb-20 sm:pt-16 sm:pb-18 lg:pt-28 lg:pb-25"
  >
    <div
      class="flex flex-col items-center w-[90%] sm:w-2/3 gap-y-2 rounded-4xl
        bg-primary-0 shadow-2xl shadow-primary-500/50 dark:bg-neutral-800 p-5"
    >
      <AppSectionHeader
        v-if="shoppingCart.length"
        :heading="printLocale('basket_title')"
        :subheading="printLocale('basket_subtitle')"
      />
      <section
        class="w-3/4 lg:w-150 xl:w-200 flex flex-col justify-center items-center
          gap-y-3 :gap-y-6 mt-2 sm:mt-4"
      >
        <template v-if="shoppingCart.length">
          <div
            v-for="el in shoppingCart"
            :key="el.item.id"
            class="w-full flex flex-col gap-y-5 md:flex-row justify-start
              items-center gap-x-5 py-4 border-b-1 border-neutral-400
              dark:border-neutral-300"
          >
            <img
              :src="el.item.image[0]"
              :alt="el.item.title"
              fit="cover"
              class="rounded-lg w-3/4 sm:w-50"
            />
            <section class="w-full flex">
              <div>
                <h1 class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ el.item.title }}
                </h1>
                <p class="text-xs dark:text-neutral-200">
                  В наличии {{ el.item.stock }}шт.
                </p>
                <UButton
                  color="neutral"
                  variant="link"
                  size="xs"
                  class="text-start p-0 text-primary underline"
                  @click="deleteShopItemFromBasket(el.item)"
                >
                  убрать
                </UButton>
              </div>
              <div class="ml-auto flex flex-col gap-y-3">
                <div
                  class="flex justify-center items-center bg-neutral-100
                    rounded-xl"
                >
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    icon="heroicons:minus-16-solid"
                    aria-label="Clear input"
                    @click="decreaseAmount(el.item)"
                  />
                  <h2 class="text-sm dark:text-neutral-600">
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
                  class="flex items-center ml-2 text-sm text-gray-800
                    dark:text-gray-200"
                >
                  ₽{{ el.item.price }}
                </h3>
              </div>
            </section>
          </div>
        </template>
        <div
          v-else
          class="w-full max-w-64 flex flex-col items-center gap-y-4 text-center"
        >
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Корзина пуста
          </h2>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            Добавьте товары из магазина
          </p>
          <UButton
            to="/shop"
            color="primary"
            variant="solid"
            label="Перейти в магазин"
          />
        </div>
        <div
          v-if="shoppingCart.length"
          class="w-full flex flex-col justify-start gap-y-5 sm:flex-row
            sm:gap-x-5 sm:px-5 dark:text-neutral-200"
        >
          <p class="mr-auto font-bold dark:text-neutral-200">Итого:</p>
          <h3>Количество: {{ totalPurchaceQty }} шт.</h3>
          <h3 class="w-fit font-extrabold">₽{{ totalPurchaseAmount }}</h3>
        </div>
        <div class="w-full flex justify-end gap-x-10 mt-4 sm:mt-6">
          <UButton
            v-if="shoppingCart.length"
            class="w-full flex justify-center p-2 sm:p-4 rounded-4xl
              text-neutral-900 border border-neutral-600 dark:text-neutral-200
              dark:hover:bg-neutral-700 dark:hover:text-neutral-400
              dark:hover:border-primary-600"
            color="info"
            size="xl"
            variant="link"
            :disabled="!totalPurchaceQty"
            @click="startOrder"
          >
            {{ purchaseButtonText }}
          </UButton>

          <UModal
            v-model:open="isOrderModalOpen"
            title="Оформление заказа"
            description="Для оформления заказа мне потребуются ваши данные"
            close-icon="heroicons:x-mark-16-solid"
          >
            <template #body>
              <OrderForm
                @close-modal="isOrderModalOpen = false"
                @success-order="onSuccess"
              />
            </template>
          </UModal>

          <UModal v-model:open="isOrderSuccessModalOpen">
            <template #content>
              <ShopSuccessOrder />
            </template>
          </UModal>
        </div>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
  import type { PurchaseParams } from '~/types'
  const { deleteShopItemFromBasket, loadPurchase, changeShopItemQty } =
    useBasketStore()
  const { totalPurchaceQty, totalPurchaseAmount, shoppingCart } =
    storeToRefs(useBasketStore())
  const isOrderModalOpen = shallowRef(false)
  const isOrderSuccessModalOpen = shallowRef(false)
  const { currentUser } = storeToRefs(useAuthStore())
  const { printLocale } = useLocales()
  const { clearBasket } = useBasketStore()
  const router = useRouter()

  const purchaseButtonText = computed(() => {
    return currentUser ? 'Заказать' : 'Оформить заказ'
  })

  const decreaseAmount = (purchaseItem: PurchaseParams) => {
    changeShopItemQty(-1, purchaseItem)
  }
  const increaseAmount = (purchaseItem: PurchaseParams) => {
    changeShopItemQty(1, purchaseItem)
  }

  function onSuccess() {
    isOrderModalOpen.value = false
    isOrderSuccessModalOpen.value = true
  }

  function startOrder() {
    metrics.trackButtonClick('startOrderButton')
    isOrderModalOpen.value = true
  }

  watch(
    isOrderSuccessModalOpen,
    () => {
      if (!isOrderSuccessModalOpen.value) {
        isOrderSuccessModalOpen.value = false
        clearBasket()
        router.push('/')
      }
    },
    {
      immediate: false,
    },
  )

  onMounted(() => {
    loadPurchase()
  })
</script>

<style scoped lang="scss"></style>
