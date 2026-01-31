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
        <div class="flex flex-col gap-3">
          <ShopARButton
            v-if="props.product.image[0]"
            :ar-model="props.product.arModel"
            :image="props.product.image[0]"
            :size="props.product.size"
            :alt="props.product.title"
            color="neutral"
          />
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
  </div>
</template>

<script setup lang="ts">
  import type { AccordionItem } from '@nuxt/ui'
  import VueMagnifier from '@websitebeaver/vue-magnifier'
  import '@websitebeaver/vue-magnifier/styles.css'
  import { nextTick, onMounted, ref } from 'vue'
  import { useProductViews } from '~/composables/useProductViews'
  import { getProductTypeLabel, isCalendarCategory } from '~/constants/products'
  import type { Product } from '~/types'

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
      label: 'Дополнительная информация',
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
