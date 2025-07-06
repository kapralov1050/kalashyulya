<template>
  <section
    class="container flex flex-col gap-y-2 pt-24 pb-3 sm:pt-16 sm:pb-18 lg:pt-28
      lg:pb-25"
  >
    <AppSectionHeader
      heading="Мой магазин"
      subheading="Здесь вы можете купить оригиналы моих работ, постеры, стикеры и открытки"
    />
    <div class="container mt-2">
      <form class="flex flex-col gap-y-2 sm:flex-row justify-center gap-x-2">
        <AppFormField
          id="shop"
          v-model="searchTitle"
          type="text"
          placeholder="Введите название"
          class="w-70% sm:w-96"
        />
        <AppButton class="w-auto mb-8 sm:mb-0" @click.prevent="handleSearch">
          <span class="hidden sm:inline">Поиск</span>
        </AppButton>
        <select
          name="filters"
          class="bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-md p-2"
        >
          <option selected disabled>Фильтры</option>
          <option value="pictures">Картины</option>
          <option value="postcards">Открытки</option>
          <option value="posters">Постеры</option>
          <option value="stikers">Стикеры</option>
        </select>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
  const searchTitle = ref('')
  const { searchProducts } = useShopStore()

  const handleSearch = () => {
    searchProducts(searchTitle.value)
  }
</script>

<style scoped lang="scss"></style>
