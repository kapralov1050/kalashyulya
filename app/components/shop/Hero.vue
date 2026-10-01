<template>
  <section class="container pt-10 sm:pt-14" aria-labelledby="shop-title">
    <div class="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-x-16">
      <div class="lg:col-span-7">
        <h1
          id="shop-title"
          class="text-[2rem] font-bold leading-[1.08] tracking-[-0.02em]
            text-neutral-900 dark:text-white sm:text-5xl"
        >
          {{ printLocale('shop_heroTitle') }}
        </h1>
        <p
          class="mt-4 max-w-[60ch] text-lg leading-[1.6] text-neutral-700
            dark:text-neutral-200"
        >
          {{ printLocale('shop_heroDescription') }}
        </p>
        <UButton
          variant="link"
          color="neutral"
          icon="i-heroicons-information-circle"
          class="mt-3 px-0 text-[0.9375rem] text-neutral-900 underline
            decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900
            dark:text-white dark:decoration-neutral-600
            dark:hover:decoration-white"
          @click="isCustomerInfoOpen = true"
        >
          Важная информация
        </UButton>
      </div>

      <UForm
        :schema="productSchema"
        :state="searchState"
        role="search"
        class="lg:col-span-5"
        @submit="submitSearch"
      >
        <div class="flex gap-2">
          <UInput
            id="search"
            v-model="searchState.title"
            type="search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Название работы"
            aria-label="Поиск по названию"
            size="lg"
            class="w-full"
          />
          <UButton
            :disabled="!searchState.title.trim()"
            type="submit"
            color="neutral"
            size="lg"
          >
            {{ printLocale('shop_searchButton') }}
          </UButton>
        </div>
      </UForm>
    </div>

    <div
      class="mt-10 lg:flex lg:items-end lg:justify-between lg:gap-8 lg:border-b
        lg:border-neutral-200 lg:dark:border-neutral-800"
    >
      <div
        role="group"
        aria-label="Категории"
        class="-mx-3 flex overflow-x-auto border-b border-neutral-200 px-3
          [scrollbar-width:none] dark:border-neutral-800 sm:mx-0 sm:px-0
          lg:-mb-px lg:border-b-0"
      >
        <button
          v-for="cat in categories"
          :key="cat.value"
          type="button"
          :aria-pressed="shopStore.categoryFilter === cat.value"
          class="-mb-px mr-6 shrink-0 whitespace-nowrap border-b-2 pb-3 pt-1
            text-[0.9375rem] font-medium transition-colors last:mr-0
            focus-visible:outline-2 focus-visible:-outline-offset-2
            focus-visible:outline-neutral-900 dark:focus-visible:outline-white"
          :class="
            shopStore.categoryFilter === cat.value
              ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
              : 'border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white'
          "
          @click="handleCategoryChange(cat.value)"
        >
          {{ cat.label }}
        </button>
      </div>

      <div class="mt-4 grid gap-2 sm:flex lg:mt-0 lg:pb-3">
        <USelectMenu
          v-model="selectedSortLabel"
          :search-input="false"
          :items="sortOptionsWithLabels"
          icon="i-heroicons-arrows-up-down"
          aria-label="Сортировка"
          class="w-full sm:w-56"
        />
        <USelectMenu
          v-model="selectedFramingLabel"
          :search-input="false"
          :items="framingOptionsWithLabels"
          aria-label="Оформление"
          class="w-full sm:w-52"
        />
      </div>
    </div>

    <div
      v-if="hasActiveFilters"
      class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      <p
        class="text-sm text-neutral-600 dark:text-neutral-300"
        aria-live="polite"
      >
        {{
          shopStore.totalItems
            ? `Найдено: ${pluralize(shopStore.totalItems, 'products')}`
            : 'Ничего не нашлось'
        }}
      </p>
      <UButton
        v-for="tag in shopStore.selectedTags"
        :key="tag"
        color="neutral"
        variant="outline"
        size="sm"
        trailing-icon="i-heroicons-x-mark-16-solid"
        :aria-label="`Убрать фильтр «${tag}»`"
        @click="removeTag(tag)"
      >
        #{{ tag }}
      </UButton>
      <UButton
        variant="link"
        color="neutral"
        class="px-0 text-sm text-neutral-900 underline decoration-neutral-300
          underline-offset-4 hover:decoration-neutral-900 dark:text-white
          dark:decoration-neutral-600 dark:hover:decoration-white"
        @click="resetSearch"
      >
        {{ printLocale('shop_clear_filters') }}
      </UButton>
    </div>

    <UModal
      v-model:open="isCustomerInfoOpen"
      scrollable
      title="Важная информация"
      :ui="{ overlay: 'bg-neutral-950/60', content: 'w-full max-w-3xl' }"
    >
      <template #body>
        <ShopCustomerInfo />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
  import type { FormSubmitEvent } from '@nuxt/ui'
  import type { productSchemaType } from '~/helpers/valibot'
  import { productSchema } from '~/helpers/valibot'
  import { ProductCategory } from '~/constants/products'
  import { pluralize } from '~/utils/pluralize'

  const shopStore = useShopStore()
  const { printLocale } = useLocales()
  const isCustomerInfoOpen = ref(false)

  const router = useRouter()
  const route = useRoute()

  const categories = computed(() => [
    { value: '', label: 'Все' },
    { value: ProductCategory.PICTURES, label: printLocale('shop_filters_pictures') },
    { value: ProductCategory.SKETCHES, label: printLocale('shop_filters_sketches') },
    { value: ProductCategory.POSTCARDS, label: printLocale('shop_filters_postcards') },
    { value: ProductCategory.STICKERS, label: printLocale('shop_filters_stickers') },
    { value: ProductCategory.CALENDARS, label: printLocale('shop_filters_calendar') },
  ])

  const resetPageInUrl = () => {
    shopStore.setPage(1)
    if (route.query.page) {
      router.push({ query: { ...route.query, page: undefined } })
    }
  }

  // Опции сортировки с читаемыми названиями
  const sortOptionsWithLabels = ref([
    'По умолчанию',
    'По названию (А-Я)',
    'По названию (Я-А)',
    'По возрастанию цены',
    'По убыванию цены',
  ])

  // Маппинг читаемых названий на значения
  const sortValueMap: Record<string, string> = {
    'По умолчанию': 'default',
    'По названию (А-Я)': 'title-asc',
    'По названию (Я-А)': 'title-desc',
    'По возрастанию цены': 'price-asc',
    'По убыванию цены': 'price-desc',
  }

  // Обратный маппинг значений на читаемые названия
  const sortLabelMap: Record<string, string> = {
    default: 'По умолчанию',
    'title-asc': 'По названию (А-Я)',
    'title-desc': 'По названию (Я-А)',
    'price-asc': 'По возрастанию цены',
    'price-desc': 'По убыванию цены',
  }

  const framingOptionsWithLabels = ref([
    'Любое оформление',
    'Без оформления',
    'С оформлением',
  ])

  const framingValueMap: Record<string, 'all' | 'none' | 'hasFraming'> = {
    'Любое оформление': 'all',
    'Без оформления': 'none',
    'С оформлением': 'hasFraming',
  }

  const framingLabelMap: Record<string, string> = {
    all: 'Любое оформление',
    none: 'Без оформления',
    hasFraming: 'С оформлением',
  }

  // Локальная переменная для отображения (читаемое название)
  const selectedSortLabel = ref(
    sortLabelMap[shopStore.sortBy] || 'По умолчанию',
  )

  // Синхронизация с store при изменении
  watch(selectedSortLabel, newLabel => {
    if (newLabel && sortValueMap[newLabel]) {
      shopStore.setSortBy(sortValueMap[newLabel])
      resetPageInUrl()
    }
  })

  // Синхронизация из store при изменении
  watch(
    () => shopStore.sortBy,
    newValue => {
      const newLabel = sortLabelMap[newValue] || 'По умолчанию'
      if (selectedSortLabel.value !== newLabel) {
        selectedSortLabel.value = newLabel
      }
    },
  )

  const selectedFramingLabel = ref(
    framingLabelMap[shopStore.framingFilter] || 'Любое оформление',
  )

  watch(selectedFramingLabel, newLabel => {
    if (newLabel && framingValueMap[newLabel]) {
      shopStore.setFramingFilter(framingValueMap[newLabel])
      resetPageInUrl()
    }
  })

  watch(
    () => shopStore.framingFilter,
    newValue => {
      const newLabel = framingLabelMap[newValue] || 'Любое оформление'
      if (selectedFramingLabel.value !== newLabel) {
        selectedFramingLabel.value = newLabel
      }
    },
  )

  const searchState = reactive({
    title: '',
  })

  const hasActiveFilters = computed(
    () =>
      shopStore.searchedProducts !== null ||
      shopStore.selectedTags.length > 0 ||
      shopStore.framingFilter !== 'all',
  )

  const submitSearch = (_event: FormSubmitEvent<productSchemaType>) => {
    shopStore.searchedProducts = shopStore.findProduct(searchState.title.trim())
    resetPageInUrl()
  }

  const removeTag = (tag: string) => {
    shopStore.removeTag(tag)
    resetPageInUrl()
  }

  const resetSearch = () => {
    shopStore.searchedProducts = null
    shopStore.clearTags()
    shopStore.setFramingFilter('all')
    searchState.title = ''
    resetPageInUrl()
  }

  const handleCategoryChange = (categoryValue: string) => {
    shopStore.categoryFilter = categoryValue
    resetPageInUrl()
  }
</script>
