<template>
  <div
    ref="contentRef"
    class="h-full overflow-y-auto scrollbar-hidden grid grid-cols-1
      lg:grid-cols-2 gap-5 md:p-10"
  >
    <!-- Artwork Image (2/3 width on desktop) -->
    <div class="flex justify-center items-center">
      <UCarousel
        v-slot="{ item }"
        :dots="props.product.image.length > 1"
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
          :mg-show="!isCalendarCategory(props.product.categoryId)"
          :mg-touch-offset-x="-35"
          :mg-touch-offset-y="-35"
          class="aspect-auto object-contain max-h-[50vh] p-5"
        />
      </UCarousel>
    </div>
    <div class="flex flex-col p-6">
      <h1
        class="title-font text-3xl font-bold text-neutral-900
          dark:text-neutral-100 mb-2"
      >
        {{ props.product.title }}
      </h1>
      <p class="text-gray-500 dark:text-neutral-200 mb-4">
        {{ subtitleProduct }}
        <span class="text-secondary-600">{{ printLocale('shop_item_author') }}</span>
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
              <p>{{ printLocale('shop_item_size') }} {{ props.product.size }} см.</p>
              <p>{{ printLocale('shop_item_material') }} {{ props.product.material }}</p>
              <p>{{ printLocale('shop_item_technique') }} {{ props.product.tecnic }}</p>
              <p>{{ printLocale('shop_item_year') }} {{ props.product.year }}</p>
              <p v-if="framingLabel">{{ printLocale('shop_item_framing') }} {{ framingLabel }}</p>
            </div>
          </template>
        </UAccordion>
      </div>

      <div class="mt-auto">
        <!-- Продано: stock=0 && isReserved -->
        <div
          v-if="product.stock === 0 && product.isReserved"
          class="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-3
            rounded-xl mb-6"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="font-medium">{{ printLocale('shop_item_sold') }}</span>
        </div>

        <!-- Цена + статус: только когда есть в наличии -->
        <div v-if="product.stock > 0" class="flex items-center justify-between mb-6">
          <!-- Цена (только если не зарезервировано) -->
          <span
            v-if="!product.isReserved"
            class="title-font text-3xl font-bold text-gray-900
              dark:text-neutral-100"
          >
            {{ props.product.price }} ₽
          </span>

          <!-- Зарезервировано: stock>0 && isReserved -->
          <div
            v-if="product.isReserved"
            class="flex items-center space-x-1.5 bg-amber-100 text-amber-700
              px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ printLocale('shop_item_reserved_detail') }}</span>
          </div>
          <span v-else class="text-green-600 font-medium">{{ printLocale('shop_item_available') }}</span>
        </div>

        <!-- Кнопка: только когда есть в наличии -->
        <UButton
          v-if="product.stock > 0"
          class="w-full bg-neutral-900 dark:bg-neutral-400 hover:bg-neutral-700
            text-white py-3 px-6 rounded-md font-medium transition flex
            items-center justify-center gap-2"
          :color="isInBasket ? 'success' : 'secondary'"
          :disabled="isInBasket"
          :loading="isLoading"
          @click="addToBasket(props.product)"
        >
          <span>
            {{ isInBasket ? printLocale('shop_item_in_basket') : printLocale('shop_item_add_to_basket') }}
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
  import { nextTick, onMounted, ref } from 'vue'
  import { useProductViews } from '~/composables/useProductViews'
  import {
    FramingTypeLabels,
    getProductTypeLabel,
    isCalendarCategory,
    ProductCategory,
  } from '~/constants/products'
  import type { Product } from '~/types'

  const { printLocale } = useLocales()

  const props = defineProps<{
    product: Product
  }>()

  const { addShopItemToBasket } = useBasketStore()
  const route = useRoute()

  const productId = String(route.query.id)
  const { trackView, getViews } = useProductViews(productId)
  const [isLoading, setLoading] = useToggle(false)
  const { isInBasket } = useProductInBasket(productId)

  const views = ref(0)

  const items: AccordionItem[] = [
    {
      label: printLocale('shop_item_details'),
      icon: 'heroicons:information-circle',
    },
  ]

  const magnifierSize = computed(() => {
    return window.innerWidth > 1024 ? 200 : 100
  })

  const zoom = computed(() => {
    return window.innerWidth > 1024 ? 1.2 : 2
  })

  const subtitleProduct = computed(() => {
    return getProductTypeLabel(props.product.categoryId)
  })

  const framingLabel = computed(() => {
    if (
      !props.product.framing ||
      (props.product.categoryId !== ProductCategory.PICTURES &&
        props.product.categoryId !== ProductCategory.SKETCHES)
    ) {
      return null
    }

    if (
      Array.isArray(props.product.framing) &&
      props.product.framing.length > 1
    ) {
      return printLocale('shop_item_framing_both')
    } else if (Array.isArray(props.product.framing)) {
      return FramingTypeLabels[props.product.framing[0]]
    }

    return ''
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

  const contentRef = ref<HTMLElement | null>(null)

  const animateScroll = () => {
    const container = contentRef.value
    if (!container) return

    const start = Date.now()
    const duration = 1500
    const scrollDistance = 100

    const step = () => {
      const elapsed = Date.now() - start
      const progress = elapsed / duration

      if (progress < 1) {
        const y = scrollDistance * Math.sin(progress * Math.PI)
        container.scrollTop = y
        requestAnimationFrame(step)
      } else {
        container.scrollTop = 0
      }
    }

    requestAnimationFrame(step)
  }

  onMounted(() => {
    trackView()
    views.value = getViews().value
    nextTick(() => {
      animateScroll()
    })

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
