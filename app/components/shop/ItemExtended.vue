<template>
  <div
    class="grid gap-8 px-4 pb-6 pt-16 sm:p-8 lg:grid-cols-12 lg:gap-x-12 lg:p-10"
  >
    <div class="lg:col-span-7 lg:self-center">
      <UCarousel
        v-slot="{ item, index }"
        :items="images"
        :dots="hasGallery"
        :arrows="hasGallery"
        :loop="hasGallery"
        :watch-drag="hasGallery && !canMagnify"
        :ui="{
          item: 'flex items-center justify-center',
          prev: 'start-2',
          next: 'end-2',
        }"
      >
        <VueMagnifier
          v-if="canMagnify"
          :key="item"
          :src="item"
          :alt="imageAlt(index)"
          :width="magnifierWidth"
          :mg-width="magnifierSize"
          :mg-height="magnifierSize"
          :zoom-factor="2"
          :mg-touch-offset-x="-35"
          :mg-touch-offset-y="-35"
          class="bg-neutral-100 shadow-[0_1px_2px_rgb(0_0_0/0.08),0_24px_48px_-28px_rgb(0_0_0/0.45)]
            dark:bg-neutral-800 dark:shadow-none"
        />
        <img
          v-else
          :src="item"
          :alt="imageAlt(index)"
          class="h-auto max-h-[min(70dvh,760px)] w-auto max-w-full bg-neutral-100
            shadow-[0_1px_2px_rgb(0_0_0/0.08),0_24px_48px_-28px_rgb(0_0_0/0.45)]
            dark:bg-neutral-800 dark:shadow-none"
        />
      </UCarousel>
    </div>

    <div class="lg:col-span-5 lg:pt-2">
      <p
        aria-hidden="true"
        class="pr-12 text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em]
          text-neutral-900 dark:text-white sm:text-3xl"
      >
        {{ product.title }}
      </p>
      <p
        v-if="typeLabel"
        class="mt-2 text-[0.9375rem] text-neutral-600 dark:text-neutral-300"
      >
        {{ typeLabel }} {{ printLocale('shop_item_author') }}
      </p>

      <div class="mt-8">
        <template v-if="isAvailable">
          <p
            class="text-2xl font-semibold tabular-nums text-neutral-900
              dark:text-white"
          >
            {{ formatPrice(product.price) }}
          </p>
          <ShopBuyButton
            :product="product"
            size="xl"
            class="mt-4 w-full justify-center sm:w-auto sm:px-8"
          />
        </template>
        <p v-else class="text-lg text-neutral-600 dark:text-neutral-300">
          {{ unavailableLabel }}
        </p>
      </div>

      <p
        v-if="description"
        class="mt-8 max-w-[60ch] whitespace-pre-line text-[1.0625rem]
          leading-[1.75] text-neutral-800 dark:text-neutral-100"
      >
        {{ description }}
      </p>

      <dl
        v-if="characteristics.length"
        class="mt-8 divide-y divide-neutral-200 border-y border-neutral-200
          text-[0.9375rem] dark:divide-neutral-800 dark:border-neutral-800"
      >
        <div
          v-for="row in characteristics"
          :key="row.label"
          class="flex justify-between gap-6 py-2.5"
        >
          <dt class="text-neutral-500 dark:text-neutral-400">
            {{ row.label }}
          </dt>
          <dd class="text-right text-neutral-900 dark:text-white">
            {{ row.value }}
          </dd>
        </div>
      </dl>

      <ul
        v-if="product.tags?.length"
        aria-label="Темы работы"
        class="mt-6 flex flex-wrap gap-x-4 gap-y-2"
      >
        <li v-for="tag in product.tags" :key="tag">
          <NuxtLink
            to="/shop"
            class="rounded-sm text-sm text-neutral-600 underline
              decoration-neutral-300 underline-offset-4 transition-colors
              hover:text-neutral-900 hover:decoration-neutral-900
              focus-visible:outline-2 focus-visible:outline-offset-4
              focus-visible:outline-neutral-900 dark:text-neutral-300
              dark:decoration-neutral-600 dark:hover:text-white
              dark:hover:decoration-white dark:focus-visible:outline-white"
            @click="showWorksByTag(tag)"
          >
            #{{ tag }}
          </NuxtLink>
        </li>
      </ul>

      <p
        v-if="views"
        class="mt-6 text-sm text-neutral-500 dark:text-neutral-400"
      >
        {{ pluralizeViews(views) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import VueMagnifier from '@websitebeaver/vue-magnifier'
  import ShopBuyButton from '~/components/shop/BuyButton.vue'
  import '@websitebeaver/vue-magnifier/styles.css'
  import { useProductViews } from '~/composables/useProductViews'
  import {
    FramingTypeLabels,
    getProductTypeLabel,
    isCalendarCategory,
    ProductCategory,
  } from '~/constants/products'
  import type { Product } from '~/types'
  import {
    formatPrice,
    formatProductSize,
    parseProductSize,
  } from '~/utils/productFormat'
  import { pluralizeViews } from '~/utils/pluralize'

  const props = defineProps<{
    product: Product
  }>()

  const { printLocale } = useLocales()
  const shopStore = useShopStore()

  const productId = String(props.product.id)
  const { trackView, getViews } = useProductViews(productId)
  const views = ref(0)

  const trackClick = (name: string) => metrics.trackButtonClick(name)

  const images = computed(() =>
    props.product.image.length
      ? props.product.image
      : ['/default-shop-image.png'],
  )
  const hasGallery = computed(() => images.value.length > 1)
  const imageAlt = (index: number) =>
    hasGallery.value
      ? `${props.product.title}, фото ${index + 1} из ${images.value.length}`
      : props.product.title

  const canMagnify = computed(
    () => !isCalendarCategory(props.product.categoryId),
  )

  const hasFinePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const magnifierSize = computed(() => (hasFinePointer.value ? 200 : 100))

  const magnifierWidth = computed(() => {
    const size = parseProductSize(props.product.size)
    const ratio = size ? size.width / size.height : 4 / 3
    return `min(100%, calc(min(70dvh, 760px) * ${ratio}))`
  })

  const typeLabel = computed(() =>
    getProductTypeLabel(props.product.categoryId),
  )

  const description = computed(() =>
    (props.product.description || '').replace(/\\n/g, '\n').trim(),
  )

  const isAvailable = computed(
    () => props.product.stock > 0 && !props.product.isReserved,
  )

  const unavailableLabel = computed(() =>
    props.product.stock === 0
      ? printLocale('shop_item_sold')
      : printLocale('shop_item_reserved_detail'),
  )

  const framingLabel = computed(() => {
    const { framing, categoryId } = props.product
    if (
      !framing?.length ||
      (categoryId !== ProductCategory.PICTURES &&
        categoryId !== ProductCategory.SKETCHES)
    ) {
      return ''
    }
    if (framing.length > 1) return printLocale('shop_item_framing_both')

    const framingKey = framing[0]
    return framingKey ? (FramingTypeLabels[framingKey] ?? '') : ''
  })

  const label = (key: string) => printLocale(key).replace(/:\s*$/, '')

  const characteristics = computed(() =>
    [
      { label: label('shop_item_size'), value: formatProductSize(props.product.size) },
      { label: label('shop_item_material'), value: props.product.material?.trim() },
      { label: label('shop_item_technique'), value: props.product.tecnic?.trim() },
      { label: label('shop_item_year'), value: props.product.year },
      { label: label('shop_item_framing'), value: framingLabel.value },
    ].filter(row => row.label && row.value),
  )

  const showWorksByTag = (tag: string) => {
    trackClick('tagFilter')
    shopStore.searchedProducts = null
    shopStore.categoryFilter = ''
    shopStore.clearTags()
    shopStore.addTag(tag)
    shopStore.setPage(1)
  }

  onMounted(() => {
    trackView()
    views.value = getViews().value

    // SEO метаданные
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl || 'https://kalashyulya.ru'
    const productImage = Array.isArray(props.product.image)
      ? (props.product.image[0] ?? '')
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
</script>
