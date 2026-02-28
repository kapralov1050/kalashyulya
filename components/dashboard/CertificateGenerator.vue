<template>
  <div class="certificate-generator">
    <h2 class="text-xl font-bold text-gray-900 mb-6">
      Генератор сертификатов подлинности
    </h2>

    <!-- Шаг 1: Выбор картины -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        1. Выберите картину
      </h3>
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Поиск -->
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по названию..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <!-- Селект картины -->
        <div class="flex-1">
          <select
            v-model="selectedProductId"
            :disabled="isLoadingProducts"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {{ isLoadingProducts ? 'Загрузка...' : 'Выберите картину' }}
            </option>
            <option
              v-for="product in filteredProducts"
              :key="product.id"
              :value="product.id"
            >
              {{ product.title }} ({{ product.year }})
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Информация о выбранной картине -->
    <div
      v-if="selectedProduct"
      class="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200"
    >
      <h4 class="font-semibold text-gray-800 mb-3">Информация о картине</h4>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Название:</span>
          <span class="ml-2 font-medium">{{ selectedProduct.title }}</span>
        </div>
        <div>
          <span class="text-gray-600">Год:</span>
          <span class="ml-2 font-medium">{{ selectedProduct.year }}</span>
        </div>
        <div>
          <span class="text-gray-600">Техника:</span>
          <span class="ml-2 font-medium">{{ selectedProduct.tecnic }}</span>
        </div>
        <div>
          <span class="text-gray-600">Материалы:</span>
          <span class="ml-2 font-medium">{{ selectedProduct.material }}</span>
        </div>
        <div>
          <span class="text-gray-600">Размер:</span>
          <span class="ml-2 font-medium">{{ selectedProduct.size }}</span>
        </div>
        <div>
          <span class="text-gray-600">ID:</span>
          <span class="ml-2 font-medium">{{ selectedProduct.id }}</span>
        </div>
      </div>
    </div>

    <!-- Шаг 2: Дата покупки -->
    <div v-if="selectedProduct" class="mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        2. Укажите дату покупки
      </h3>
      <input
        v-model="purchaseDate"
        type="date"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none
          focus:ring-2 focus:ring-blue-500"
      />
      <p class="mt-2 text-sm text-gray-600">
        Если дата не указана, будет использована текущая дата
      </p>
    </div>

    <!-- Кнопка генерации -->
    <div v-if="selectedProduct" class="flex justify-end">
      <button
        :disabled="isGenerating"
        class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white
          rounded-lg hover:bg-blue-700 disabled:bg-gray-400
          disabled:cursor-not-allowed transition-colors font-medium"
        @click="handleGenerateCertificate"
      >
        <svg
          v-if="!isGenerating"
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <svg
          v-else
          class="w-5 h-5 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ isGenerating ? 'Генерация...' : 'Скачать сертификат' }}
      </button>
    </div>

    <!-- Сообщение об успехе/ошибке -->
    <div
      v-if="message"
      :class="[
        'mt-6 p-4 rounded-lg',
        message.type === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-800 border border-red-200',
      ]"
    >
      <div class="flex items-center gap-2">
        <svg
          v-if="message.type === 'success'"
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        {{ message.text }}
      </div>
    </div>

    <!-- Предпросмотр картин -->
    <div v-if="filteredProducts.length > 0" class="mt-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Все картины</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          :class="[
            'cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg',
            String(selectedProductId) === String(product.id)
              ? 'border-blue-500 shadow-md'
              : 'border-transparent hover:border-gray-300',
          ]"
          @click="selectedProductId = product.id"
        >
          <img
            :src="getProductImage(product)"
            :alt="product.title"
            class="w-full aspect-square object-cover"
          />
          <div class="p-2 bg-white">
            <p class="text-sm font-medium truncate">{{ product.title }}</p>
            <p class="text-xs text-gray-500">{{ product.year }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Product } from '~/types'

  const shopStore = useShopStore()
  const { shopData } = storeToRefs(shopStore)

  const searchQuery = ref('')
  const selectedProductId = ref<number | string>('')
  const purchaseDate = ref<string>('')
  const isGenerating = ref(false)
  const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

  // Получаем все товары
  const products = computed<Product[]>(() => {
    if (!shopData.value?.products) return []
    return Object.values(shopData.value.products)
  })

  // Загрузка продуктов
  const isLoadingProducts = computed(() => {
    return !shopData.value?.products
  })

  // Фильтрация по поиску
  const filteredProducts = computed(() => {
    if (!searchQuery.value) return products.value
    const query = searchQuery.value.toLowerCase()
    return products.value.filter(p => p.title.toLowerCase().includes(query))
  })

  // Выбранный продукт
  const selectedProduct = computed(() => {
    if (!selectedProductId.value) return null
    const id = Number(selectedProductId.value)
    return products.value.find(p => p.id === id) || null
  })

  // Безопасное получение изображения
  const getProductImage = (product: Product): string => {
    if (product.image && product.image.length > 0) {
      return product.image[0]
    }
    // Заглушка, если изображения нет
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif"%3ENo image%3C/text%3E%3C/svg%3E'
  }

  const { generateCertificate: generatePdfCertificate } = usePdfGenerator()

  const handleGenerateCertificate = async () => {
    if (!selectedProduct.value) return

    isGenerating.value = true
    message.value = null

    try {
      // Формируем дату для отправки
      const dateToSend = purchaseDate.value
        ? new Date(purchaseDate.value).toISOString()
        : new Date().toISOString()

      await generatePdfCertificate(selectedProduct.value, dateToSend)

      message.value = {
        type: 'success',
        text: `Сертификат для "${selectedProduct.value.title}" успешно сгенерирован!`,
      }

      // Очищаем сообщение через 5 секунд
      setTimeout(() => {
        message.value = null
      }, 5000)
    } catch (error) {
      message.value = {
        type: 'error',
        text: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      }
    } finally {
      isGenerating.value = false
    }
  }
</script>

<style scoped>
  .certificate-generator {
    max-width: 100%;
  }

  select::-ms-expand {
    display: none;
  }

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }
</style>
