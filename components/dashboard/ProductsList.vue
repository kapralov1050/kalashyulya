<template>
  <div class="bg-white rounded-xl shadow-sm">
    <!-- Header -->
    <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">Список товаров</h2>
      <p class="text-sm text-gray-600 mt-1">
        Управление товарами в магазине
      </p>
    </div>

    <!-- Instruction Memo -->
    <div class="px-4 sm:px-6 py-3 bg-blue-50 border-b border-blue-100">
      <button
        class="flex items-center gap-2 text-sm font-medium text-blue-700 w-full
          text-left hover:text-blue-800 transition-colors"
        @click="isMemoOpen = !isMemoOpen"
      >
        <svg
          class="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Как управлять товарами</span>
        <svg
          class="w-4 h-4 ml-auto transition-transform duration-200"
          :class="isMemoOpen ? 'rotate-180' : ''"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        v-if="isMemoOpen"
        class="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-blue-800"
      >
        <div class="flex items-start gap-2">
          <span class="text-blue-500 mt-0.5">•</span>
          <span>
            <b>Наличие:</b> измените число в поле и нажмите «Сохранить». Товары
            с количеством 0 и без брони скрываются из магазина.
          </span>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-blue-500 mt-0.5">•</span>
          <span>
            <b>Бронь:</b> переключите тумблер и подтвердите. При брони
            с количеством 0 товар отображается как «Продано».
          </span>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-blue-500 mt-0.5">•</span>
          <span>
            <b>Удаление:</b> удаляет товар и все его файлы безвозвратно.
            Минимум один товар должен оставаться в магазине.
          </span>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-blue-500 mt-0.5">•</span>
          <span>
            <b>Фильтры и сортировка:</b> используйте панель ниже для быстрого
            поиска товаров по статусу, категории или для сортировки.
          </span>
        </div>
      </div>
    </div>

    <!-- Filters & Sort -->
    <div class="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <!-- Status Filter -->
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            class="px-3 py-1 text-xs font-medium rounded-full border
              transition-colors duration-150"
            :class="statusFilter === option.value
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'"
            @click="setStatusFilter(option.value)"
          >
            {{ option.label }}
            <span class="ml-1 opacity-60">{{ getStatusCount(option.value) }}</span>
          </button>
        </div>

        <div
          class="flex flex-col sm:flex-row gap-2 sm:items-center sm:ml-auto"
        >
          <!-- Category Filter -->
          <select
            v-model="categoryFilter"
            class="text-sm border border-gray-300 rounded-lg px-3 py-1.5
              focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          >
            <option value="">Все категории</option>
            <option
              v-for="(label, id) in ProductCategoryLabels"
              :key="id"
              :value="id"
            >
              {{ label }}
            </option>
          </select>

          <!-- Sort -->
          <select
            v-model="sortBy"
            class="text-sm border border-gray-300 rounded-lg px-3 py-1.5
              focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          >
            <option value="id">По номеру</option>
            <option value="price-asc">Цена ↑</option>
            <option value="price-desc">Цена ↓</option>
            <option value="title-asc">Название А–Я</option>
            <option value="title-desc">Название Я–А</option>
            <option value="stock-asc">Наличие ↑</option>
            <option value="stock-desc">Наличие ↓</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Products List -->
    <div class="divide-y divide-gray-200">
      <div
        v-for="product in paginatedItems"
        :key="product.id"
        class="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
      >
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <!-- Product Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start gap-2 flex-wrap">
              <h3 class="text-base font-medium text-gray-900 break-words">
                <span class="text-gray-400 font-mono">#{{ product.id }}</span>
                {{ product.title }}
              </h3>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full
                  text-xs font-medium shrink-0"
                :class="getStatusChipClass(product)"
              >
                {{ getStatusChipLabel(product) }}
              </span>
            </div>
            <div
              class="flex items-center gap-x-3 gap-y-1 mt-1.5 flex-wrap text-sm
                text-gray-500"
            >
              <span class="font-semibold text-gray-700">
                {{ product.price }} ₽
              </span>
              <span class="text-gray-300">·</span>
              <span>{{ product.stock }} шт.</span>
              <template v-if="getCategoryName(product.categoryId)">
                <span class="text-gray-300">·</span>
                <span class="text-gray-400">
                  {{ getCategoryName(product.categoryId) }}
                </span>
              </template>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <!-- Stock Controls -->
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500 shrink-0">Наличие:</span>
              <input
                :value="stockInputs[product.id] ?? product.stock"
                type="number"
                min="0"
                class="w-16 px-2 py-1 text-sm border border-gray-300 rounded-lg
                  text-center focus:outline-none focus:ring-2
                  focus:ring-blue-500"
                @input="onStockInput(
                  product.id,
                  ($event.target as HTMLInputElement).value,
                )"
              />
              <button
                v-if="hasStockChange(product.id)"
                class="flex items-center gap-1 px-2.5 py-1 text-blue-600 border
                  border-blue-300 rounded-lg hover:bg-blue-50
                  transition-colors duration-200 font-medium text-xs shrink-0"
                @click="updateStock(product.id)"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Сохранить
              </button>
            </div>

            <!-- Reservation Toggle -->
            <div class="flex items-center gap-2">
              <span
                class="text-xs font-medium"
                :class="pendingReservations[product.id] !== undefined
                  ? 'text-amber-600'
                  : 'text-gray-500'"
              >
                {{ getReservationLabel(product.id) }}
              </span>
              <button
                :class="[
                  'relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1',
                  getReservationStatus(product.id)
                    ? 'bg-amber-500'
                    : 'bg-gray-200',
                ]"
                @click="toggleReservation(product.id)"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    getReservationStatus(product.id)
                      ? 'translate-x-5'
                      : 'translate-x-0',
                  ]"
                />
              </button>
              <button
                v-if="hasPendingChange(product.id)"
                class="flex items-center gap-1 px-2.5 py-1 text-amber-600 border
                  border-amber-300 rounded-lg hover:bg-amber-50
                  transition-colors duration-200 font-medium text-xs shrink-0"
                @click="confirmReservation(product.id)"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Подтвердить
              </button>
            </div>

            <!-- Delete -->
            <button
              class="flex items-center gap-1 px-2.5 py-1 text-red-500 border
                border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300
                transition-colors duration-200 text-xs font-medium shrink-0"
              @click="removeProduct(product.id)"
            >
              <svg
                class="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col
        sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <span class="text-sm text-gray-500">
        {{ paginationStart }}–{{ paginationEnd }} из
        {{ filteredItems.length }}
      </span>
      <div class="flex flex-wrap gap-1">
        <button
          :disabled="currentPage === 1"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg
            disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50
            transition-colors"
          @click="currentPage--"
        >
          ←
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          class="px-3 py-1.5 text-sm border rounded-lg transition-colors min-w-9"
          :class="page === currentPage
            ? 'bg-gray-900 text-white border-gray-900'
            : 'border-gray-300 hover:bg-gray-50'"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
        <button
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg
            disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50
            transition-colors"
          @click="currentPage++"
        >
          →
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredItems.length === 0"
      class="px-6 py-12 text-center"
    >
      <svg
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        {{
          orderedShopItems.length === 0
            ? 'Товаров пока нет'
            : 'Ничего не найдено'
        }}
      </h3>
      <p class="text-gray-500">
        {{
          orderedShopItems.length === 0
            ? 'Добавьте первый товар через форму выше'
            : 'Попробуйте изменить фильтры'
        }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    getDataByPath,
    removeDataByPath,
    updateDataByPath,
  } from '~/helpers/firebase/manageDatabase'
  import { showToast } from '~/helpers/showToast'
  import {
    ProductCategoryLabels,
    getCategoryLabel,
  } from '~/constants/products'
  import type { Product } from '~/types'

  type ProductStatus = 'available' | 'reserved' | 'sold' | 'hidden'
  type StatusFilter = 'all' | ProductStatus

  const shopStore = useShopStore()
  const { deleteFile } = useYandexDatabase()

  const orderedShopItems = computed(() => {
    const items = Object.values(shopStore.shopData?.products ?? {})
    return items.sort((a, b) => a.id - b.id)
  })

  // ───────────────── UI state ─────────────────
  const isMemoOpen = ref(false)
  const statusFilter = ref<StatusFilter>('all')
  const categoryFilter = ref('')
  const sortBy = ref('id')
  const currentPage = ref(1)
  const itemsPerPage = 10

  const statusOptions: { value: StatusFilter, label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'available', label: 'Доступны' },
    { value: 'reserved', label: 'Забронированы' },
    { value: 'sold', label: 'Продано' },
    { value: 'hidden', label: 'Скрыты' },
  ]

  const getProductStatus = (product: Product): ProductStatus => {
    if (product.stock > 0 && !product.isReserved) return 'available'
    if (product.stock > 0 && product.isReserved) return 'reserved'
    if (product.stock === 0 && product.isReserved) return 'sold'
    return 'hidden'
  }

  const getStatusChipClass = (product: Product): string => {
    switch (getProductStatus(product)) {
      case 'available':
        return 'bg-green-100 text-green-700'
      case 'reserved':
        return 'bg-amber-100 text-amber-700'
      case 'sold':
        return 'bg-gray-200 text-gray-700'
      case 'hidden':
        return 'bg-red-100 text-red-600'
    }
  }

  const getStatusChipLabel = (product: Product): string => {
    switch (getProductStatus(product)) {
      case 'available':
        return 'Доступен'
      case 'reserved':
        return 'Забронирован'
      case 'sold':
        return 'Продано'
      case 'hidden':
        return 'Скрыт'
    }
  }

  const getStatusCount = (status: StatusFilter): number => {
    if (status === 'all') return orderedShopItems.value.length
    return orderedShopItems.value.filter(
      p => getProductStatus(p) === status,
    ).length
  }

  const setStatusFilter = (status: StatusFilter): void => {
    statusFilter.value = status
  }

  const getCategoryName = (categoryId: string): string => {
    if (!categoryId) return ''
    return getCategoryLabel(categoryId)
  }

  // ───────────────── Filtering / sorting / pagination ─────────────────
  const filteredItems = computed(() => {
    let items = orderedShopItems.value

    if (statusFilter.value !== 'all') {
      items = items.filter(p => getProductStatus(p) === statusFilter.value)
    }

    if (categoryFilter.value) {
      items = items.filter(p => p.categoryId === categoryFilter.value)
    }

    const sorted = [...items]
    switch (sortBy.value) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price)
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title, 'ru'))
      case 'stock-asc':
        return sorted.sort((a, b) => a.stock - b.stock)
      case 'stock-desc':
        return sorted.sort((a, b) => b.stock - a.stock)
      default:
        return sorted
    }
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredItems.value.length / itemsPerPage)),
  )

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return filteredItems.value.slice(start, start + itemsPerPage)
  })

  const paginationStart = computed(
    () => (currentPage.value - 1) * itemsPerPage + 1,
  )
  const paginationEnd = computed(() =>
    Math.min(currentPage.value * itemsPerPage, filteredItems.value.length),
  )

  const visiblePages = computed(() => {
    const pages: number[] = []
    const total = totalPages.value
    const current = currentPage.value
    const maxVisible = 5

    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      let start = Math.max(1, current - Math.floor(maxVisible / 2))
      const end = Math.min(total, start + maxVisible - 1)
      start = Math.max(1, end - maxVisible + 1)
      for (let i = start; i <= end; i++) pages.push(i)
    }

    return pages
  })

  // Reset page when filter set changes or list shrinks below current page
  watch([statusFilter, categoryFilter, sortBy], () => {
    currentPage.value = 1
  })

  watch(totalPages, total => {
    if (currentPage.value > total) currentPage.value = total
  })

  // ───────────────── Stock editing ─────────────────
  const stockInputs = ref<Record<number, number | undefined>>({})

  const onStockInput = (productId: number, value: string): void => {
    const parsed = parseInt(value, 10)
    stockInputs.value[productId] = isNaN(parsed) ? 0 : Math.max(0, parsed)
  }

  const hasStockChange = (productId: number): boolean => {
    if (stockInputs.value[productId] === undefined) return false
    const product = shopStore.shopData?.products?.[`product_${productId}`]
    return stockInputs.value[productId] !== (product?.stock ?? 0)
  }

  const updateStock = async (productId: number): Promise<void> => {
    const newStock = stockInputs.value[productId]
    if (newStock === undefined) return

    try {
      await updateDataByPath(
        { stock: newStock },
        `shop/products/product_${productId}`,
      )
      Reflect.deleteProperty(stockInputs.value, productId)
      showToast(
        'Успешно!',
        `Наличие товара обновлено: ${newStock} шт.`,
        'heroicons:check-circle',
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Ошибка при обновлении наличия:', error)
      showToast(
        'Ошибка',
        'Не удалось обновить наличие. Попробуйте еще раз.',
        'heroicons:exclamation-circle',
      )
    }
  }

  // ───────────────── Reservation ─────────────────
  const pendingReservations = ref<Record<number, boolean | undefined>>({})

  const getReservationStatus = (productId: number): boolean => {
    const product = shopStore.shopData?.products?.[`product_${productId}`]
    const currentStatus = product?.isReserved || false
    return pendingReservations.value[productId] ?? currentStatus
  }

  const hasPendingChange = (productId: number): boolean => {
    return pendingReservations.value[productId] !== undefined
  }

  const getReservationLabel = (productId: number): string => {
    const product = shopStore.shopData?.products?.[`product_${productId}`]
    const currentStatus = product?.isReserved || false
    const displayStatus = pendingReservations.value[productId] ?? currentStatus

    if (pendingReservations.value[productId] !== undefined) {
      return displayStatus ? 'В брони' : 'Не забронирован'
    }
    return currentStatus ? 'Забронирован' : 'Доступен'
  }

  const toggleReservation = (productId: number): void => {
    const displayStatus = getReservationStatus(productId)
    pendingReservations.value[productId] = !displayStatus
  }

  const confirmReservation = async (productId: number): Promise<void> => {
    const pendingValue = pendingReservations.value[productId]

    if (pendingValue === null || pendingValue === undefined) {
      return
    }

    try {
      await updateDataByPath(
        { isReserved: pendingValue },
        `shop/products/product_${productId}`,
      )

      Reflect.deleteProperty(pendingReservations.value, productId)

      showToast(
        'Успешно!',
        `Статус брони товара обновлен на "${
          pendingValue ? 'Забронирован' : 'Доступен'
        }"`,
        'heroicons:check-circle',
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Ошибка при обновлении статуса брони:', error)

      Reflect.deleteProperty(pendingReservations.value, productId)

      showToast(
        'Ошибка',
        'Не удалось обновить статус брони. Попробуйте еще раз.',
        'heroicons:exclamation-circle',
      )
    }
  }

  // ───────────────── Removal ─────────────────
  const removeProduct = async (productid: number): Promise<void> => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return

    const allProducts = await getDataByPath<Record<string, Product>>(
      'shop/products',
      {},
    )
    if (allProducts && Object.keys(allProducts).length === 1) {
      alert(
        'Нельзя удалить последний товар. Добавь другой, и затем удали ненужный',
      )
      return
    }

    const filesToDelete = shopStore.getProductFileName(productid)

    if (filesToDelete) {
      for (const file in filesToDelete) {
        await deleteFile(file)
      }
    }

    await removeDataByPath(`shop/products/product_${productid}`)
  }
</script>
