<template>
  <div
    class="h-full overflow-y-auto scrollbar-hidden grid grid-cols-1
      lg:grid-cols-2 gap-10 md:gap-20 p-5 md:p-10"
  >
    <!-- Artwork Image (2/3 width on desktop) -->
    <div class="flex justify-center items-center">
      <UCarousel
        v-slot="{ item }"
        :arrows="props.product.image.length > 1"
        :items="props.product.image"
        loop
        touch="false"
        :watch-drag="false"
      >
        <VueMagnifier
          :key="item"
          :src="item"
          :alt="props.product.title"
          :mg-width="magnifierSize"
          :mg-height="magnifierSize"
          :zoom-factor="zoom"
          :mg-show="props.product.categoryId !== '5'"
          :mg-touch-offset-x="-35"
          :mg-touch-offset-y="-35"
          class="aspect-auto object-contain"
        />
      </UCarousel>
    </div>
    <div
      class="flex flex-col bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm
        border border-neutral-100 dark:border-neutral-600"
    >
      <h1
        class="title-font text-3xl font-bold text-neutral-900
          dark:text-neutral-100 mb-2"
      >
        {{ props.product.title }}
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
        {{ props.product.description }}
      </div>

      <div class="text-sm">
        <UAccordion type="multiple" :items="items">
          <template #content>
            <div class="pb-5">
              <p>Размер: {{ props.product.size }} см.</p>
              <p>Материал: {{ props.product.material }}</p>
              <p>Техника: {{ props.product.tecnic }}</p>
              <p>Год: {{ props.product.year }}</p>
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
            {{ props.product.price }} ₽
          </span>
          <span class="text-green-600 font-medium">В наличии</span>
        </div>
        <UButton
          class="w-full bg-neutral-900 dark:bg-neutral-400 hover:bg-neutral-700
            text-white py-3 px-6 rounded-md font-medium transition flex
            items-center justify-center gap-2"
          :color="isInBasket ? 'success' : 'secondary'"
          :disabled="isInBasket"
          :loading="isLoading"
          @click="addToBasket(props.product)"
        >
          <span>
            {{ isInBasket ? 'В корзине' : 'Добавить в корзину' }}
          </span>
        </UButton>
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
  import type { Product } from '~/types'

  const props = defineProps<{
    product: Product
  }>()

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

  const magnifierSize = computed(() => {
    return window.innerWidth > 1024 ? 200 : 100
  })

  const zoom = computed(() => {
    return window.innerWidth > 1024 ? 1.2 : 2
  })

  const subtitleProduct = computed(() => {
    switch (props.product.categoryId) {
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

  onMounted(() => {
    trackView()
    views.value = getViews().value

    // SEO метаданные
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl || 'https://kalashyulya.ru'
    const productImage = Array.isArray(props.product.image)
      ? props.product.image[0]
      : props.product.image

    useSeo({
      title: props.product.title,
      description:
        props.product.description ||
        `${props.product.title} - авторская работа Юлии Калашниковой`,
      image: productImage,
      type: 'website',
    })

    // Структурированные данные
    const { generateProduct, addStructuredData } = useStructuredData()
    const productData = generateProduct({
      name: props.product.title,
      description: props.product.description || '',
      image: productImage,
      price: props.product.price,
      currency: 'RUB',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/shop/${props.product.id}`,
    })
    addStructuredData(productData)
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
