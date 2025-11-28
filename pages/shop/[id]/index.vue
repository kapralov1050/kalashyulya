<template>
  <div v-if="selectedProduct" class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
      <!-- Artwork Image (2/3 width on desktop) -->
      <div class="relative max-w-3xl mx-auto">
        <UCarousel
          v-slot="{ item }"
          :arrows="selectedProduct.image.length > 1"
          :items="selectedProduct.image"
          loop
          touch="false"
          class="w-full"
          :watch-drag="false"
        >
          <VueMagnifier
            :key="item"
            :src="item"
            :alt="selectedProduct.title"
            :mg-width="200"
            :mg-height="200"
            :zoom-factor="1"
            :mg-show="selectedProduct.categoryId !== '5'"
            class="max-h-[50vh] bg-white border border-neutral-200
              dark:border-neutral-600 rounded-xl shadow-sm object-cover"
          />
        </UCarousel>
      </div>
      <!-- Product Info (1/3 width on desktop) -->
      <div
        class="flex flex-col bg-white dark:bg-neutral-800 p-6 rounded-xl
          shadow-sm border border-neutral-100 dark:border-neutral-600"
      >
        <h1
          class="title-font text-3xl font-bold text-neutral-900
            dark:text-neutral-100 mb-2"
        >
          {{ selectedProduct.title }}
        </h1>
        <p class="text-gray-500 dark:text-neutral-200 mb-4">
          {{ subtitleProduct }}
          <span class="text-secondary-600">Юлии Калашниковой</span>
        </p>

        <div class="flex items-center mb-6">
          <span class="text-gray-500 dark:text-neutral-200 text-sm">
            ({{ pluralizeViews(views) }})
          </span>
        </div>

        <div class="text-gray-600 dark:text-neutral-200 mb-6 break-normal">
          {{ selectedProduct.description }}
        </div>

        <div class="text-sm">
          <UAccordion type="multiple" :items="items">
            <template #content>
              <div class="pb-5">
                <p>Размер: {{ selectedProduct.size }} см.</p>
                <p>Материал: {{ selectedProduct.material }}</p>
                <p>Техника: {{ selectedProduct.tecnic }}</p>
                <p>Год: {{ selectedProduct.year }}</p>
              </div>
            </template>
          </UAccordion>
        </div>

        <div class="mt-auto">
          <div class="flex items-center justify-between mb-6">
            <span
              class="title-font text-3xl font-bold text-gray-900
                dark:text-neutral-100"
            >
              ₽ {{ selectedProduct.price }}
            </span>
            <span class="text-green-600 font-medium">В наличии</span>
          </div>
          <UButton
            class="w-full bg-neutral-900 dark:bg-neutral-400
              hover:bg-neutral-700 text-white py-3 px-6 rounded-md font-medium
              transition flex items-center justify-center gap-2"
            :color="isInBasket ? 'success' : 'secondary'"
            :disabled="isInBasket"
            :loading="isLoading"
            @click="addToBasket(selectedProduct)"
          >
            <span>
              {{ isInBasket ? 'В корзине' : 'Добавить в корзину' }}
            </span>
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { AccordionItem } from '@nuxt/ui'
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
  const [isLoading, setLoading] = useToggle(false)

  const views = ref(0)

  const items: AccordionItem[] = [
    {
      label: 'Дополнительная информация',
      icon: 'heroicons:information-circle',
    },
  ]

  const isInBasket = computed(() => {
    return shoppingCart.value.some(el => el.item.id.toString() == productId)
  })

  const subtitleProduct = computed(() => {
    switch (selectedProduct.value?.categoryId) {
      case '1':
        return 'Оригинальная работа'
      case '2':
        return 'Оригинальный работа'
      case '3':
        return 'Авторская открытка'
      case '4':
        return 'Авторский стикерпак'
      case '5':
        return 'Авторские календари'
      default:
        return ''
    }
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

  watch(allProducts, newProducts => {
    if (newProducts && newProducts.length > 0) {
      findAndSetProduct()
    }
  })

  const findAndSetProduct = () => {
    const productIdNum = Number(params.id)

    if (allProducts.value && allProducts.value.length > 0) {
      const product = allProducts.value.find(item => item.id === productIdNum)

      if (product) {
        selectedProduct.value = product
        trackView()
        views.value = getViews().value
      }
    }
  }

  onMounted(() => {
    if (allProducts.value && allProducts.value.length > 0) {
      findAndSetProduct()
    }
  })

  onMounted(() => {
    const el = document.querySelector('.carousel-wrapper')
    if (el) {
      el.addEventListener(
        'touchmove',
        e => {
          e.preventDefault()
        },
        { passive: false },
      )
    }
  })
</script>

<style scoped></style>
