<template>
  <section
    class="container flex flex-col gap-y-2 pt-24 pb-3 sm:pt-16 sm:pb-18 lg:pt-28
      lg:pb-25"
  >
    <AppSectionHeader
      :heading="$t('shop.heroTitle')"
      :subheading="$t('shop.heroDescription')"
    />
    <div class="container mt-2">
      <form class="flex flex-col gap-y-2 sm:flex-row justify-center gap-x-2">
        <AppFormField
          id="shop"
          v-model="searchTitle"
          type="text"
          :placeholder="$t('shop.searchPlaceholder')"
          class="w-70% sm:w-96"
        />
        <AppButton class="w-auto mb-8 sm:mb-0" @click.prevent="handleSearch">
          <span class="hidden sm:inline">{{ $t('shop.searchButton') }}</span>
        </AppButton>
        <select
          name="filters"
          class="bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-md p-2"
        >
          <option selected disabled>{{ $t('shop.filtersTitle') }}</option>
          <option value="pictures">{{ $t('shop.filters.pictures') }}</option>
          <option value="postcards">{{ $t('shop.filters.postcards') }}</option>
          <option value="posters">{{ $t('shop.filters.posters') }}</option>
          <option value="stikers">{{ $t('shop.filters.stickers') }}</option>
        </select>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
  const searchTitle = ref('')
  const shopStore = useShopStore()

  const handleSearch = () => {
    shopStore.searchedResults = shopStore.searchProducts(searchTitle.value)
  }
</script>

<style scoped lang="scss"></style>
