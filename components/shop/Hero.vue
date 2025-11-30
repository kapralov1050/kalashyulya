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

        <div class="flex flex-wrap justify-center gap-2 w-full">
          <UButton
            v-for="(cat, index) in [{ value: '', label: 'Все' }, ...categories]"
            :key="index"
            :color="
              shopStore.categoryFilter === cat.value ? 'primary' : 'neutral'
            "
            variant="soft"
            size="md"
            class="transition-all hover:scale-105"
            @click="shopStore.categoryFilter = cat.value"
          >
            {{ cat.label }}
          </UButton>
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
  ]

  const searchState = reactive({
    title: '',
  })

  const submitSearch = (event: FormSubmitEvent<productSchemaType>) => {
    shopStore.searchedProducts = shopStore.findProduct(searchState.title)
  }

  const resetSearch = () => {
    shopStore.searchedProducts = null
    searchState.title = ''
  }
</script>
