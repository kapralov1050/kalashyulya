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
            <!-- Product Image Placeholder -->

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
  import { removeDataByPath } from '~/helpers/firebase/manageDatabase'

  const shopStore = useShopStore()
  const { deleteFile } = useYandexDatabase()

  const removeProduct = async (productid: number) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      await removeDataByPath(`shop/products/product_${productid}`)

      const fileToDelete = shopStore.getProductFileName(productid)

      if (fileToDelete) {
        await deleteFile(fileToDelete)
      }
    }
  }
</script>
