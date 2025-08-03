<template>
  <form class="flex flex-col gap-y-4">
    <h1>Добавление нового товара</h1>
    <select
      v-model="formData.category"
      name="filters"
      class="bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-md p-2"
    >
      <option selected value="">{{ $t('shop.filtersTitle') }}</option>
      <option value="1">{{ $t('shop.filters.pictures') }}</option>
      <option value="2">{{ $t('shop.filters.sketches') }}</option>
      <option value="3">{{ $t('shop.filters.postcards') }}</option>
      <option value="4">{{ $t('shop.filters.stickers') }}</option>
    </select>

    <AppFormField
      id="title"
      v-model="formData.title"
      type="text"
      placeholder="Введите название"
      label="Название товара"
      class="w-70% sm:w-96"
    />

    <AppFormField
      id="description"
      v-model="formData.description"
      type="textarea"
      placeholder="Введите описание"
      label="Описание"
      class="w-70% sm:w-96"
    />

    <AppFormField
      id="price"
      v-model="formData.price"
      type="text"
      placeholder="Введите цену"
      label="Цена товара"
      class="w-70% sm:w-96"
    />

    <AppFormField
      id="stock"
      v-model="formData.stock"
      type="text"
      placeholder="Введите количество товара"
      label="Количество товара товара"
      class="w-70% sm:w-96"
    />

    <AppFormField
      id="imageUrl"
      v-model="formData.imageUrl"
      type="email"
      placeholder="Ссылка на изображение"
      label="Изображение"
      class="w-70% sm:w-96"
    />

    <UInputTags v-model="formData.tags" />

    <div class="flex justify-around">
      <UButton
        loading-auto
        size="xl"
        class="self-center"
        variant="outline"
        @click.prevent="createProduct"
      >
        Отправить
      </UButton>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { useFirebase } from '~/composables/firebase/useFirebase'
  import { showToast } from '~/helpers/showToast'

  const { addNewProduct } = useFirebase()

  const formData = reactive({
    category: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    tags: [],
    title: '',
  })

  const createProduct = async () => {
    const newProduct = {
      categoryId: formData.category,
      description: formData.description,
      image: formData.imageUrl,
      price: Number(formData.price),
      stock: Number(formData.stock),
      tags: formData.tags,
      title: formData.title,
    }

    await addNewProduct(newProduct, 'shop/products/')

    showToast(
      'success',
      'Product created successfully',
      'heroicons:check-circle',
    )
  }
</script>

<style scoped lang="scss"></style>
