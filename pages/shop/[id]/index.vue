<template>
  <div v-if="selectedProduct" class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Artwork Image (2/3 width on desktop) -->
      <div class="lg:w-2/3 bg-white rounded-xl shadow-lg overflow-hidden">
        <div
          class="bg-gray-50 flex items-center justify-center border
            border-gray-200 rounded-lg overflow-hidden"
        >
          <VueMagnifier
            :src="selectedProduct.image"
            class="w-full h-auto rounded-md object-cover"
            :alt="selectedProduct.title"
            :mg-width="200"
            :mg-height="200"
            :zoom-factor="1.2"
          />
        </div>
      </div>

      <!-- Product Info (1/3 width on desktop) -->
      <div
        class="lg:w-1/3 flex flex-col bg-white p-6 rounded-xl shadow-sm border
          border-gray-100"
      >
        <h1 class="title-font text-3xl font-bold text-gray-900 mb-2">
          {{ selectedProduct.title }}
        </h1>
        <p class="text-gray-500 mb-4">
          Оригинальная работа
          <span class="text-indigo-600">Юлии Калашниковой</span>
        </p>

        <div class="flex items-center mb-6">
          <span class="text-gray-500 text-sm">
            ({{ pluralizeViews(views) }})
          </span>
        </div>

        <div class="prose max-w-none text-gray-600 mb-6">
          {{ selectedProduct.description }}
        </div>

        <div class="mt-auto">
          <div class="flex items-center justify-between mb-6">
            <span class="title-font text-3xl font-bold text-gray-900">
              ₽ {{ selectedProduct.price }}
            </span>
            <span class="text-green-600 font-medium">В наличии</span>
          </div>
          <UButton
            class="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6
              rounded-md font-medium transition flex items-center justify-center
              gap-2"
            :color="isInBasket ? 'success' : 'secondary'"
            :disabled="isInBasket"
            :loading="isLoading"
            @click="addToBasket(selectedProduct)"
          >
            <span>
              {{ isInBasket ? 'В корзине' : 'Добавить в корзину' }}
            </span>
          </UButton>

          <div class="mt-4 text-center">
            <a
              href="#"
              class="text-indigo-600 hover:text-indigo-800 text-sm font-medium
                inline-flex items-center gap-1"
            >
              <i data-feather="rotate-ccw" class="w-4 h-4"></i>
              <span>Дополнительная информация</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import VueMagnifier from '@websitebeaver/vue-magnifier'
  import '@websitebeaver/vue-magnifier/styles.css'
  import { onMounted, ref } from 'vue'
  import { useProductViews } from '~/composables/useProductViews'
  import { useShopStore } from '~/stores/shop'
  import type { Product } from '~/types'

  const shopStore = useShopStore()
  const { allProducts } = storeToRefs(shopStore)
  const selectedProduct = ref<Product | null>(null)
  const { addShopItemToBasket } = useBasketStore()
  const { shoppingCart } = storeToRefs(useBasketStore())
  const { params } = useRoute()
  const productId = String(params.id)
  const { trackView, getViews } = useProductViews(productId)
  const views = ref(0)
  const [isLoading, setLoading] = useToggle(false)

  const isInBasket = computed(() => {
    return shoppingCart.value.some(el => el.item.id.toString() == productId)
  })

  const addToBasket = async (product: Product) => {
    setLoading(true)
    await new Promise(resolve => {
      setTimeout(resolve, 1000)
    })

    const { description, categoryId, tags, ...purchaseParams } = product

    const purchase = {
      amount: 1,
      item: purchaseParams,
    }
    addShopItemToBasket(purchase)

    setLoading(false)
  }

  onMounted(async () => {
    const productIdNum = Number(params.id)

    if (allProducts.value) {
      const product = allProducts.value.find(item => item.id === productIdNum)

      if (product) {
        selectedProduct.value = product
      }
    }
    trackView()
    views.value = getViews().value

    console.log(views.value)
  })
</script>

<style scoped></style>
