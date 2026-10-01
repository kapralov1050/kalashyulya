<template>
  <section
    id="shop-products"
    class="container scroll-mt-[calc(var(--header-height)+1.5rem)]"
    aria-label="Товары"
  >
    <div
      v-if="isLoading"
      class="grid animate-pulse gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3
        lg:gap-x-12"
      aria-hidden="true"
    >
      <div v-for="n in 6" :key="`skeleton-${n}`">
        <div class="aspect-[4/3] w-full bg-neutral-200 dark:bg-neutral-800" />
        <div class="mt-4 h-5 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div class="mt-2 h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div class="mt-4 flex items-center justify-between">
          <div class="h-5 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div class="h-9 w-40 rounded-md bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    </div>

    <UAlert
      v-else-if="error"
      :title="printLocale('shop_list_error_loading')"
      :description="errorMessage"
      icon="i-heroicons-exclamation-triangle"
      color="neutral"
      variant="outline"
    />

    <div
      v-else-if="!paginatedProducts.length"
      class="flex min-h-[200px] items-center justify-center rounded-2xl
        bg-neutral-50 p-6 text-center dark:bg-neutral-900/80"
    >
      <p class="text-neutral-600 dark:text-neutral-300">
        По этим условиям ничего не нашлось. Попробуйте изменить поиск или
        фильтры.
      </p>
    </div>

    <template v-else>
      <div
        class="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12"
      >
        <ShopItem
          v-for="item in paginatedProducts"
          :key="`${item.id}-${currentPage}`"
          :product="item"
        />
      </div>

      <nav
        v-if="totalPages > 1"
        aria-label="Страницы каталога"
        class="mt-16 flex items-center justify-between gap-4 border-t
          border-neutral-200 pt-6 dark:border-neutral-800"
      >
        <UButton
          color="neutral"
          variant="ghost"
          icon="heroicons:arrow-left-20-solid"
          :disabled="currentPage <= 1"
          :class="['-ml-2.5', pagerButtonClass]"
          @click="handlePageChange(currentPage - 1)"
        >
          Назад
        </UButton>

        <UPagination
          as="div"
          :page="currentPage"
          :total="totalItems"
          :items-per-page="shopStore.itemsPerPage"
          color="neutral"
          variant="ghost"
          :sibling-count="1"
          :show-controls="false"
          class="hidden sm:block"
          @update:page="handlePageChange"
        >
          <template #item="{ item, page }">
            <UButton
              color="neutral"
              :variant="page === item.value ? 'solid' : 'ghost'"
              :label="String(item.value)"
              :aria-label="`Страница ${item.value}`"
              class="min-w-9 justify-center tabular-nums"
            />
          </template>
        </UPagination>
        <p
          class="text-sm tabular-nums text-neutral-600 dark:text-neutral-300
            sm:hidden"
        >
          Страница {{ currentPage }} из {{ totalPages }}
        </p>

        <UButton
          color="neutral"
          variant="ghost"
          trailing-icon="heroicons:arrow-right-20-solid"
          :disabled="currentPage >= totalPages"
          :class="['-mr-2.5', pagerButtonClass]"
          @click="handlePageChange(currentPage + 1)"
        >
          Далее
        </UButton>
      </nav>
    </template>

    <ProductModal
      :selected-product="selectedProduct"
      :is-product-modal-open="isProductModalOpen"
      @close="closeModal"
    />
  </section>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import ProductModal from '~/components/shop/ProductModal.vue'
  import { useProductModal } from '~/composables/useProductModal'

  const { printLocale } = useLocales()
  const route = useRoute()
  const router = useRouter()

  const shopStore = useShopStore()
  const {
    shopData,
    currentPage,
    paginatedProducts,
    totalItems,
    totalPages,
    isLoading,
  } = storeToRefs(shopStore)

  const pagerButtonClass =
    'text-[0.9375rem] text-neutral-900 disabled:text-neutral-400 dark:text-white dark:disabled:text-neutral-500'

  const { isProductModalOpen, selectedProduct, closeModal } = useProductModal()

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

  const isUpdatingPage = ref(false)

  function handlePageChange(page: number) {
    if (isUpdatingPage.value) return

    isUpdatingPage.value = true

    shopStore.setPage(page)

    router
      .push({ query: { ...route.query, page: page.toString() } })
      .then(() => {
        document
          .getElementById('shop-products')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
