<template>
  <div class="container flex justify-center mb-5">
    <section
      class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 min-w-full"
    >
      <template v-if="isLoading">
        <div
          v-for="n in 3"
          :key="`skeleton-${n}`"
          class="h-[420px] w-full rounded-2xl border border-gray-200 bg-white
            p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/60
            animate-pulse"
        >
          <div class="space-y-3">
            <USkeleton class="h-[200px] w-full rounded-xl" />
            <USkeleton class="h-4 w-3/4" />
            <div class="space-y-2">
              <USkeleton class="h-3 w-full" />
              <USkeleton class="h-3 w-2/3" />
            </div>
            <USkeleton class="h-10 w-full rounded-lg" />
          </div>
        </div>
      </template>

      <template v-else-if="error">
        <UAlert
          :title="printLocale('shop_list_error_loading')"
          :description="errorMessage"
          icon="i-heroicons-exclamation-triangle"
          color="error"
          variant="solid"
          class="col-span-full"
        />
      </template>

      <template v-else>
        <ShopItem
          v-for="item in paginatedProducts"
          :key="`${item.id}-${currentPage}`"
          :product="item"
          :is-in-basket="checkStatus(item)"
          @buy="handleBuyClick"
          @add-to-basket="addToBasket"
          @filter-by-tag="handleTagClick"
        />

        <div class="flex justify-center mt-8 col-span-full">
          <UPagination
            v-model:page="currentPage"
            :total="totalItems"
            :items-per-page="shopStore.itemsPerPage"
            color="neutral"
            active-color="neutral"
            :sibling-count="1"
            show-controls
            @update:page="handlePageChange"
          />
        </div>
      </template>

      <ProductModal
        :selected-product="selectedProduct"
        :is-product-modal-open="isProductModalOpen"
        @close="closeModal"
      />

      <!-- Buy Action Modal -->
      <BuyActionModal
        v-model:open="isBuyActionModalOpen"
        :item-count="totalPurchaceQty"
        :basket-amount="totalPurchaseAmount"
        :product="modalProduct"
        @buy-only="handleBuyOnly"
        @add-to-basket="handleAddToBasket"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import BuyActionModal from '~/components/shop/BuyActionModal.vue'
  import ProductModal from '~/components/shop/ProductModal.vue'
  import { useProductModal } from '~/composables/useProductModal'
  import type { Product } from '~/types'

  const { printLocale } = useLocales()
  const route = useRoute()
  const router = useRouter()

  const { clearBasket } = useBasketStore()

  const shopStore = useShopStore()
  const {
    shopData,
    currentPage,
    paginatedProducts,
    totalItems,
    isLoading,
  } = storeToRefs(shopStore)

  const { isProductModalOpen, selectedProduct, closeModal } = useProductModal()

  const isBuyActionModalOpen = ref(false)
  const modalProduct = ref<Product | null>(null)
  const basketStore = useBasketStore()
  const { totalPurchaceQty, totalPurchaseAmount } = storeToRefs(basketStore)

  const handleBuyClick = (product: Product) => {
    metrics.trackButtonClick('buyButton')
    modalProduct.value = product

    if (totalPurchaceQty.value > 0) {
      isBuyActionModalOpen.value = true
    } else {
      addToBasketAndGo(product, false)
    }
  }

  const handleBuyOnly = async () => {
    isBuyActionModalOpen.value = false
    await addToBasketAndGo(modalProduct.value!, true)
  }

  const handleAddToBasket = async () => {
    isBuyActionModalOpen.value = false
    await addToBasketAndGo(modalProduct.value!, false)
  }

  const addToBasketAndGo = async (
    product: Product,
    shouldClearBasket: boolean = false,
  ) => {
    if (shouldClearBasket) {
      clearBasket()
    }

    await addToBasket(product)
    router.push('/basket')
  }

  const error = computed(() => {
    if (shopData.value instanceof Error) {
      return shopData.value
    }
    if (!shopData.value || Object.keys(shopData.value).length === 0) {
      return new Error('Данные не загружены')
    }
    return null
  })

  const errorMessage = computed(() => {
    if (!error.value) return ''
    return (
      error.value.message ||
      'Не удалось загрузить товары из магазина. Пожалуйста, попробуйте позже.'
    )
  })

  const checkStatus = (prod: Product) => {
    const { isInBasket } = useProductInBasket(prod.id)
    return isInBasket.value
  }

  const addToBasket = async (product: Product) => {
    await new Promise(resolve => {
      setTimeout(resolve, 300)
    })

    const { description, categoryId, tags, ...purchaseParams } = product

    const purchase = {
      amount: 1,
      item: purchaseParams,
    }
    basketStore.addShopItemToBasket(purchase)
  }

  function handleTagClick(tag: string) {
    if (shopStore.selectedTags.includes(tag)) {
      shopStore.removeTag(tag)
    } else {
      shopStore.addTag(tag)
    }

    if (route.query.page) {
      router.push({ query: { ...route.query, page: undefined } })
    }
  }

  const isUpdatingPage = ref(false)

  function handlePageChange(page: number) {
    if (isUpdatingPage.value) return

    isUpdatingPage.value = true

    shopStore.setPage(page)

    router
      .push({ query: { ...route.query, page: page.toString() } })
      .then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        isUpdatingPage.value = false
      })
  }

  onMounted(() => {
    if (route.query.page) {
      const page = Number(route.query.page)
      if (!isNaN(page) && page > 0) {
        shopStore.setPage(page)
      }
    }
  })
</script>

<style scoped>
  .scrollbar-hidden {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .scrollbar-hidden::-webkit-scrollbar {
    display: none;
  }
</style>