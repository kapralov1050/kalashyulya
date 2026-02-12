<template>
  <div class="bg-white rounded-xl shadow-sm">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">Список товаров</h2>
      <p class="text-sm text-gray-600 mt-1">Управление товарами в магазине</p>
    </div>

    <!-- Products List -->
    <div class="divide-y divide-gray-200">
      <div
        v-for="product in shopStore.allProducts"
        :key="product.id"
        class="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
      >
        <div class="flex items-center justify-between">
          <!-- Product Info -->
          <div class="flex items-center space-x-4 flex-1">
            <!-- Product Details -->
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium text-gray-900 truncate">
                {{ product.title }}
              </h3>
              <div class="flex items-center space-x-4 mt-1">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full
                    text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ product.stock }} в наличии
                </span>
                <span class="text-lg font-semibold text-gray-900">
                  {{ product.price }} ₽
                </span>
              </div>
            </div>
          </div>

          <!-- Reservation Controls -->
          <div class="flex items-center space-x-4">
            <!-- Toggle Switch -->
            <div class="flex items-center space-x-3">
              <span
                class="text-sm font-medium"
                :class="pendingReservations[product.id] ? 'text-amber-600' : 'text-gray-600'"
              >
                {{ getReservationLabel(product.id) }}
              </span>
              <button
                :class="[
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
                  getReservationStatus(product.id) ? 'bg-amber-600' : 'bg-gray-200',
                ]"
                @click="toggleReservation(product.id)"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    getReservationStatus(product.id) ? 'translate-x-5' : 'translate-x-0',
                  ]"
                />
              </button>
            </div>

            <!-- Confirm Button -->
            <button
              v-if="hasPendingChange(product.id)"
              class="flex items-center space-x-2 px-4 py-2 text-amber-600 border
                border-amber-300 rounded-lg hover:bg-amber-50 hover:border-amber-400
                transition-colors duration-200 font-medium"
              @click="confirmReservation(product.id)"
            >
              <svg
                class="w-4 h-4"
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
              <span>Подтвердить</span>
            </button>

            <!-- Delete Button -->
            <button
              class="flex items-center space-x-2 px-4 py-2 text-red-600 border
                border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400
                transition-colors duration-200 font-medium"
              @click="removeProduct(product.id)"
            >
              <svg
                class="w-4 h-4"
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
              <span>Удалить</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="shopStore.allProducts.length === 0"
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
      <h3 class="text-lg font-medium text-gray-900 mb-2">Товаров пока нет</h3>
      <p class="text-gray-500">Добавьте первый товар через форму выше</p>
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
  import type { Product } from '~/types'

  const shopStore = useShopStore()
  const { deleteFile } = useYandexDatabase()

  // Хранилище для отслеживания изменений
  const pendingReservations = ref<Record<number, boolean | undefined>>({})

  const getReservationStatus = (productId: number): boolean => {
    const product = shopStore.allProducts.find(p => p.id === productId)
    const currentStatus = product?.isReserved || false
    // Если есть pending изменение, возвращаем его, иначе текущий статус
    return pendingReservations.value[productId] ?? currentStatus
  }

  const hasPendingChange = (productId: number): boolean => {
    return pendingReservations.value[productId] !== undefined
  }

  const getReservationLabel = (productId: number): string => {
    const product = shopStore.allProducts.find(p => p.id === productId)
    const currentStatus = product?.isReserved || false
    const displayStatus = pendingReservations.value[productId] ?? currentStatus

    if (pendingReservations.value[productId] !== undefined) {
      return displayStatus ? 'В брони' : 'Не забронирован'
    }
    return currentStatus ? 'Забронирован' : 'Доступен'
  }

  const toggleReservation = (productId: number): void => {
    // Переключаем между отображаемым состоянием
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

      // Успешное обновление - сбрасываем pending состояние
      Reflect.deleteProperty(pendingReservations.value, productId)

      showToast(
        'Успешно!',
        `Статус брони товара обновлен на "${pendingValue ? 'Забронирован' : 'Доступен'}"`,
        'heroicons:check-circle',
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Ошибка при обновлении статуса брони:', error)

      // При ошибке убираем pending состояние (тогл вернется в исходное положение)
      Reflect.deleteProperty(pendingReservations.value, productId)

      showToast(
        'Ошибка',
        'Не удалось обновить статус брони. Попробуйте еще раз.',
        'heroicons:exclamation-circle',
      )
    }
  }

  const removeProduct = async (productid: number) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
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
  }
</script>
