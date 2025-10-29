<template>
  <section
    class="container flex flex-col gap-y-2 pt-24 pb-3 sm:pt-16 sm:pb-18 lg:pt-28
      lg:pb-25"
  >
    <AppSectionHeader
      :heading="printLocale('shop_heroTitle')"
      :subheading="printLocale('shop_heroDescription')"
    />
    <div
      class="container flex flex-col gap-y-2 sm:flex-row justify-center gap-x-2
        mt-2"
    >
      <UForm
        :schema="productSchema"
        :state="searchState"
        class="flex flex-col gap-y-5 items-center md:flex-row md:gap-x-5"
        @submit="submitSearch"
      >
        <div class="flex flex-row gap-x-5">
          <UFormField>
            <UInput
              id="search"
              v-model="searchState.title"
              type="search"
              placeholder="Название товара"
              class="w-70% sm:w-96"
            />
          </UFormField>

          <UFormField>
            <select
              v-model="shopStore.categoryFilter"
              name="filters"
              class="w-70% md:w-auto bg-gray-100 text-gray-900 hover:bg-gray-200
                rounded-md p-2"
            >
              <option selected value="">
                {{ printLocale('shop_filtersTitle') }}
              </option>
              <option value="1">
                {{ printLocale('shop_filters_pictures') }}
              </option>
              <option value="2">
                {{ printLocale('shop_filters_sketches') }}
              </option>
              <option value="3">
                {{ printLocale('shop_filters_postcards') }}
              </option>
              <option value="4">
                {{ printLocale('shop_filters_stickers') }}
              </option>
            </select>
          </UFormField>
        </div>
        <div class="w-full flex justify-center gap-x-3">
          <UButton
            type="submit"
            color="neutral"
            size="lg"
            class="flex justify-center dark:text-neutral-800 mb-8 sm:mb-0"
          >
            {{ printLocale('shop_searchButton') }}
          </UButton>
          <UButton
            v-if="shopStore.searchedProducts"
            color="secondary"
            variant="outline"
            size="lg"
            class="flex justify-center dark:text-neutral-800 mb-8 sm:mb-0"
            @click="resetSearch"
          >
            Очистить
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

<style scoped lang="scss"></style>
