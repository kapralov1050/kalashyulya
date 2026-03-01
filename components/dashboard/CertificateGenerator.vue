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

    <!-- Шаг 2.5: Номер сертификата -->
    <div v-if="selectedProduct" class="mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        2.5. Номер сертификата
      </h3>
      <input
        v-model="certificateNumber"
        type="text"
        placeholder="Оставьте пустым для автогенерации"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none
          focus:ring-2 focus:ring-blue-500"
      />
      <p class="mt-2 text-sm text-gray-600">
        Необязательно. Укажите номер вручную для коррекции ошибок (формат:
        JK-2026-001)
      </p>
    </div>

    <!-- Шаг 3: Дополнительная информация -->
    <div v-if="selectedProduct" class="mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        3. Дополнительная информация
      </h3>
      <textarea
        v-model="additionalInfo"
        rows="4"
        placeholder="Введите дополнительную информацию для сертификата..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <p class="mt-2 text-sm text-gray-600">
        Необязательно поле. Информация будет отображена в сертификате
      </p>
    </div>

    <!-- Кнопка генерации -->
    <div v-if="selectedProduct" class="flex justify-end">
      <button
        :disabled="isFormDisabled"
        class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white
          rounded-lg hover:bg-blue-700 disabled:bg-gray-400
          disabled:cursor-not-allowed transition-colors font-medium"
        @click="handleGenerateCertificate"
      >
        {{ blockMessage || 'Скачать сертификат' }}
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
            product.certificateId ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          @click="handleSelectProduct(product.id)"
        >
          <img
            :src="getProductImage(product)"
            :alt="product.title"
            class="w-full aspect-square object-cover"
          />
          <div class="p-2 bg-white relative">
            <p class="text-sm font-medium truncate">{{ product.title }}</p>
            <p class="text-xs text-gray-500">{{ product.year }}</p>
            <p
              v-if="product.certificateId"
              class="text-xs font-semibold text-blue-600 mt-1"
            >
              Сертификат: {{ product.certificateId }}
            </p>
            <!-- Кнопка удаления сертификата -->
            <button
              v-if="product.certificateId"
              title="Удалить номер сертификата"
              @click.stop="handleRemoveCertificate(product.id)"
              class="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700
                hover:bg-red-50 rounded-md transition-colors"
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
                  d="M6 18L18 6M6 6l12 12M18 6l-12 12"
                />
              </svg>
            </button>
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
  const { removeCertificateIdFromProduct } = useCertificateCounter()

  const searchQuery = ref('')
  const selectedProductId = ref<number | string>('')
  const purchaseDate = ref<string>('')
  const certificateNumber = ref<string>('')
  const additionalInfo = ref<string>('')
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

  // Проверяем, выбран ли продукт с уже выданным сертификатом
  const isProductWithCertificate = computed(() => {
    if (!selectedProductId.value) return false
    const product = products.value.find(
      p => p.id === Number(selectedProductId.value),
    )
    return product?.certificateId ? true : false
  })

  // Блокировка кнопки и полей формы
  const isFormDisabled = computed(() => {
    return isGenerating.value || isProductWithCertificate.value
  })

  // Сообщение блокировки
  const blockMessage = computed(() => {
    if (isProductWithCertificate.value) {
      return 'Недоступно, удалите сущестующий сертификат'
    }
    return ''
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

  const handleSelectProduct = (productId: number | string) => {
    const product = products.value.find(p => p.id === Number(productId))
    if (product?.certificateId) {
      // Если у продукта уже есть сертификат, показываем предупреждение и блокируем
      return
    }

    selectedProductId.value = productId

    // Очищаем форму и поля, если был выбран продукт с сертификатом
    const prevProduct = products.value.find(
      p => p.id === Number(selectedProductId.value),
    )
    if (prevProduct?.certificateId) {
      certificateNumber.value = ''
      additionalInfo.value = ''
    }
  }

  const handleRemoveCertificate = async (productId: number) => {
    try {
      await removeCertificateIdFromProduct(productId)
      message.value = {
        type: 'success',
        text: `Номер сертификата успешно удален`,
      }
      setTimeout(() => {
        message.value = null
      }, 3000)
    } catch (error) {
      message.value = {
        type: 'error',
        text: `Ошибка удаления: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      }
    }
  }

  const handleGenerateCertificate = async () => {
    if (!selectedProduct.value) return

    isGenerating.value = true
    message.value = null

    try {
      // Формируем дату для отправки
      const dateToSend = purchaseDate.value
        ? new Date(purchaseDate.value).toISOString()
        : new Date().toISOString()

      // Используем ручной номер сертификата если указан, иначе генерируем автоматически
      const manualCertNumber = certificateNumber.value.trim() || undefined

      await generatePdfCertificate(
        selectedProduct.value,
        dateToSend,
        additionalInfo.value || undefined,
        manualCertNumber,
      )

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
