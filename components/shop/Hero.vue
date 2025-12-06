<template>
  <section
    class="container flex flex-col gap-y-2 pt-24 pb-3 sm:pt-16 sm:pb-18 lg:pt-28
      lg:pb-25"
  >
    <AppSectionHeader
      :heading="printLocale('shop_heroTitle')"
      :subheading="printLocale('shop_heroDescription')"
    />

    <div class="container flex flex-col items-center gap-y-5 mt-2">
      <UForm
        :schema="productSchema"
        :state="searchState"
        class="w-full flex flex-col items-center gap-y-5"
        @submit="submitSearch"
      >
        <div class="flex justify-center gap-x-3 w-full">
          <UFormField class="w-full max-w-2xl">
            <UInput
              id="search"
              v-model="searchState.title"
              type="search"
              placeholder="Название товара"
              class="w-full"
            />
          </UFormField>

          <UButton
            :disabled="!searchState.title"
            type="submit"
            color="neutral"
            size="lg"
            class="dark:text-neutral-800"
          >
            {{ printLocale('shop_searchButton') }}
          </UButton>
          <UButton
            v-if="shopStore.searchedProducts"
            color="secondary"
            size="lg"
            class="dark:text-neutral-800"
            @click="resetSearch"
          >
            Очистить
          </UButton>
        </div>

        <ShopCustomerInfo />

        <div class="flex flex-wrap items-center justify-center gap-2 w-full">
          <div class="flex flex-wrap justify-center gap-2">
            <UButton
              v-for="(cat, index) in [
                { value: '', label: 'Все' },
                ...categories,
              ]"
              :key="index"
              :color="
                shopStore.categoryFilter === cat.value ? 'primary' : 'neutral'
              "
              variant="soft"
              size="md"
              class="transition-all hover:scale-105"
              @click="handleCategoryChange(cat.value)"
            >
              {{ cat.label }}
            </UButton>
          </div>

          <div class="ml-auto flex items-center gap-2">
            <UIcon name="i-heroicons-arrows-up-down" class="w-4 h-4" />
            <USelectMenu
              v-model="selectedSortLabel"
              :search-input="false"
              :options="sortOptionsWithLabels"
              size="md"
            />
          </div>
        </div>
      </UForm>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { FormSubmitEvent } from '@nuxt/ui'
  import type { productSchemaType } from '~/helpers/valibot'
  import { productSchema } from '~/helpers/valibot'

  const shopStore = useShopStore()
  const { printLocale } = useLocales()

  const categories = [
    { value: '1', label: printLocale('shop_filters_pictures') },
    { value: '2', label: printLocale('shop_filters_sketches') },
    { value: '3', label: printLocale('shop_filters_postcards') },
    { value: '4', label: printLocale('shop_filters_stickers') },
    { value: '5', label: printLocale('shop_filters_calendar') },
  ]

  // Опции сортировки с читаемыми названиями
  const sortOptionsWithLabels = ref([
    'По умолчанию',
    'По названию (А-Я)',
    'По названию (Я-А)',
    'По цене (по возрастанию)',
    'По цене (по убыванию)',
  ])

  // Маппинг читаемых названий на значения
  const sortValueMap: Record<string, string> = {
    'По умолчанию': 'default',
    'По названию (А-Я)': 'title-asc',
    'По названию (Я-А)': 'title-desc',
    'По цене (по возрастанию)': 'price-asc',
    'По цене (по убыванию)': 'price-desc',
  }

  // Обратный маппинг значений на читаемые названия
  const sortLabelMap: Record<string, string> = {
    default: 'По умолчанию',
    'title-asc': 'По названию (А-Я)',
    'title-desc': 'По названию (Я-А)',
    'price-asc': 'По цене (по возрастанию)',
    'price-desc': 'По цене (по убыванию)',
  }

  // Локальная переменная для отображения (читаемое название)
  const selectedSortLabel = ref(
    sortLabelMap[shopStore.sortBy] || 'По умолчанию',
  )

  // Синхронизация с store при изменении
  watch(selectedSortLabel, newLabel => {
    if (newLabel && sortValueMap[newLabel]) {
      shopStore.setSortBy(sortValueMap[newLabel])
      // Сбрасываем страницу при изменении сортировки
      shopStore.setPage(1)
      if (route.query.page) {
        router.push({ query: { ...route.query, page: undefined } })
      }
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

  const searchState = reactive({
    title: '',
  })

  const router = useRouter()
  const route = useRoute()

  const submitSearch = (_event: FormSubmitEvent<productSchemaType>) => {
    shopStore.searchedProducts = shopStore.findProduct(searchState.title)
    // Сбрасываем страницу и убираем page из URL при поиске
    shopStore.setPage(1)
    if (route.query.page) {
      router.push({ query: { ...route.query, page: undefined } })
    }
  }

  const resetSearch = () => {
    shopStore.searchedProducts = null
    searchState.title = ''
    // Сбрасываем страницу и убираем page из URL при сбросе поиска
    shopStore.setPage(1)
    if (route.query.page) {
      router.push({ query: { ...route.query, page: undefined } })
    }
  }

  const handleCategoryChange = (categoryValue: string) => {
    shopStore.categoryFilter = categoryValue
    // Сбрасываем страницу и убираем page из URL при изменении категории
    shopStore.setPage(1)
    if (route.query.page) {
      router.push({ query: { ...route.query, page: undefined } })
    }
  }
</script>
