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

      <template v-else-if="false">
        <UAlert
          title="Ошибка загрузки товаров"
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
          @buy="buyNow"
          @add-to-basket="addToBasket"
          @filter-by-tag="handleTagCLick"
        />

        <div class="mt-8 flex justify-center col-span-full">
          <div class="flex justify-center mt-8 col-span-full">
            <UPagination
              v-model:page="currentPage"
              :total="totalItems"
              :items-per-page="shopStore.itemsPerPage"
              color="neutral"
              active-color="neutral"
              :show-controls="false"
              @update:page="handlePageChange"
            />
          </div>
        </div>
      </template>

      <UModal
        v-if="selectedProduct && selectedProduct.id"
        v-model:open="isProductModalOpen"
        :ui="{
          content: 'min-w-[70vw] h-auto p-10 shadow-4xl',
          overlay: 'bg-black/50 backdrop-blur-sm',
        }"
      >
        <template #content>
          <ShopItemExtended :product="selectedProduct" />
        </template>
      </UModal>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import { useFirebase } from '~/composables/firebase/useFirebase'
  import type { Product } from '~/types'

  const route = useRoute()
  const router = useRouter()
  const isProductModalOpen = ref(false)
  const selectedProductId = ref<string | null>(null)

  const basketStore = useBasketStore()
  const { addShopItemToBasket } = useBasketStore()

  const shopStore = useShopStore()
  const {
    searchedProducts,
    shopData,
    currentPage,
    paginatedProducts,
    totalItems,
  } = storeToRefs(shopStore)
  const { isLoading } = useFirebase()

  const error = computed(() => {
    if (shopData.value instanceof Error) {
      return shopData.value
    }
    if (!shopData || Object.keys(shopData).length === 0) {
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

  const selectedProduct = computed(() => {
    if (!selectedProductId.value) return null
    return shopStore.allProducts.find(
      p => p.id.toString() === selectedProductId.value,
    )
  })

  const checkStatus = (prod: Product) => {
    return basketStore.shoppingCart.some(el => el.item.id === prod.id)
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
    addShopItemToBasket(purchase)
  }

  const buyNow = async (product: Product) => {
    addToBasket(product)
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })
    router.push('/basket')
  }

  function handleTagCLick(tag: string) {
    searchedProducts.value = shopStore.filterProductsByTag(tag)

    if (route.query.page) {
      router.push({ query: { ...route.query, page: undefined } })
    }
  }

  const isUpdatingPage = ref(false)

  function handlePageChange(page: number) {
    if (isUpdatingPage.value) return

    isUpdatingPage.value = true

    // v-model:page уже обновил currentPage, но нужно обновить в store
    shopStore.setPage(page)

    // Обновляем URL
    router
      .push({ query: { ...route.query, page: page.toString() } })
      .then(() => {
        // Прокручиваем вверх после обновления URL
        window.scrollTo({ top: 0, behavior: 'smooth' })
        isUpdatingPage.value = false
      })
  }

  watch(
    () => route.query.productModal,
    newVal => {
      isProductModalOpen.value = !!newVal
      selectedProductId.value = newVal?.toString() || null
    },
  )

  watch(isProductModalOpen, isOpen => {
    if (!isOpen && route.query.productModal) {
      router.replace({ query: { ...route.query, productModal: undefined } })
    }
  })

  onMounted(() => {
    if (route.query.page) {
      const page = Number(route.query.page)
      if (!isNaN(page) && page > 0) {
        shopStore.setPage(page)
      }
    }

    if (route.query.productModal) {
      isProductModalOpen.value = true
      selectedProductId.value = route.query.productModal?.toString() || null
    }
  })

  // Отслеживаем изменения page в URL (например, при навигации назад/вперед)
  watch(
    () => route.query.page,
    (newPage, oldPage) => {
      // Пропускаем обновление, если мы сами обновляем страницу
      if (isUpdatingPage.value) return

      if (newPage) {
        const page = Number(newPage)
        if (!isNaN(page) && page > 0 && page !== currentPage.value) {
          shopStore.setPage(page)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } else if (oldPage && !newPage) {
        // Если page был удален из URL, сбрасываем на первую страницу
        if (currentPage.value !== 1) {
          shopStore.setPage(1)
        }
      }
    },
  )
</script>
