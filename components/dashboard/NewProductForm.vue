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
      id="description"
      v-model="formData.size"
      type="textarea"
      placeholder="Введите размер"
      label="Размер"
      class="w-70% sm:w-96"
    />

    <AppFormField
      id="description"
      v-model="formData.material"
      type="textarea"
      placeholder="Введите материалы"
      label="Материалы"
      class="w-70% sm:w-96"
    />

    <AppFormField
      id="description"
      v-model="formData.tecnic"
      type="textarea"
      placeholder="Введите технику"
      label="Техника"
      class="w-70% sm:w-96"
    />

    <AppFormField
      id="description"
      v-model="formData.year"
      type="textarea"
      placeholder="Введите год"
      label="Год"
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

    <UFormField label="Тег">
      <UInputTags
        v-model="formData.tags"
        placeholder="введи тег и нажми Enter..."
      />
    </UFormField>

    <UFileUpload v-model="fileInput" class="w-96 min-h-48" />

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
  const { uploadToMountedBucket } = useYandexDatabase()

  const formData = reactive({
    category: '',
    description: '',
    size: '',
    material: '',
    tecnic: '',
    year: '',
    price: '',
    stock: '',
    imageUrl: '',
    tags: [],
    title: '',
  })

  const fileInput = ref<File>()

  async function createProduct() {
    try {
      let imageUrl = ''
      let fileName = ''

      if (fileInput.value) {
        const response = await uploadToMountedBucket(fileInput.value)
        if (response) {
          imageUrl = response.path
          fileName = response.fileName
        }
      }

      const newProduct = {
        categoryId: formData.category,
        description: formData.description,
        size: formData.size,
        material: formData.material,
        tecnic: formData.tecnic,
        year: formData.year,
        image: imageUrl,
        file: fileName,
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
    } catch (error) {
      showToast('error', error as string, 'heroicons:exclamation-circle')
    }
  }
</script>

<style scoped lang="scss"></style>
