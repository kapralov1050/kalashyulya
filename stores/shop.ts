import type { Product } from '~/types'

import { useFirebase } from '~/composables/firebase/useFirebase'

export const useShopStore = defineStore('shop', () => {
  const { shopData } = useFirebase()

  const searchedProducts = ref<Product[] | null>(null)
  const categoryFilter = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(12)
  const sortBy = ref<string>('default')
  const selectedTags = ref<string[]>([])

  // При изменении фильтра категории очищаем searchedProducts и сбрасываем страницу
  watch(categoryFilter, (newValue, oldValue) => {
    // Игнорируем первое срабатывание при инициализации
    if (oldValue !== undefined) {
      searchedProducts.value = null
      currentPage.value = 1
    }
  })

  // Функция сортировки товаров
  function sortProducts(products: Product[]): Product[] {
    const sorted = [...products]

    switch (sortBy.value) {
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title, 'ru'))
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price)
      default:
        return sorted
    }
  }

  const allProducts = computed<Product[] | []>(() => {
    if (!shopData.value?.products) return []

    let products = Object.values(shopData.value.products)

    // Фильтрация по категории
    if (categoryFilter.value) {
      products = products.filter(
        prod => prod.categoryId === categoryFilter.value,
      )
    }

    // Фильтрация по тегам
    if (selectedTags.value.length > 0) {
      products = products.filter(prod =>
        selectedTags.value.every(tag => prod.tags?.includes(tag)),
      )
    }

    // Сортировка
    return sortProducts(products)
  })

  const paginatedProducts = computed(() => {
    // Используем searchedProducts, если они есть, иначе allProducts
    let sourceProducts =
      searchedProducts.value && searchedProducts.value.length > 0
        ? [...searchedProducts.value]
        : allProducts.value

    // Применяем сортировку
    sourceProducts = sortProducts(sourceProducts)

    // Явно отслеживаем currentPage и itemsPerPage для реактивности
    const page = currentPage.value
    const perPage = itemsPerPage.value

    const start = (page - 1) * perPage
    const end = start + perPage

    // Возвращаем новый массив для гарантии реактивности
    return [...sourceProducts.slice(start, end)]
  })

  // Вычисляем totalItems на основе источника данных для пагинации
  const computedTotalItems = computed(() => {
    if (searchedProducts.value && searchedProducts.value.length > 0) {
      return searchedProducts.value.length
    }
    return allProducts.value.length
  })

  function setSortBy(sort: string) {
    sortBy.value = sort
    currentPage.value = 1 // Сбрасываем на первую страницу при изменении сортировки
  }

  const totalPages = computed(() => {
    return Math.ceil(computedTotalItems.value / itemsPerPage.value)
  })

  const findProduct = (searchQry: string) => {
    if (!allProducts) return []

    return allProducts.value.filter(prod =>
      prod.title.toLowerCase().includes(searchQry.toLowerCase()),
    )
  }

  function addTag(tag: string) {
    if (!selectedTags.value.includes(tag)) {
      selectedTags.value.push(tag)
    }
  }

  function removeTag(tag: string) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  }

  function clearTags() {
    selectedTags.value = []
  }

  function filterProductsByTag(tag: string) {
    addTag(tag)
    return filterProductsByTags()
  }

  function filterProductsByTags() {
    if (!allProducts.value) return []

    const filtered = allProducts.value.filter(prod =>
      selectedTags.value.every(tag => prod.tags?.includes(tag)),
    )
    searchedProducts.value = filtered
    currentPage.value = 1

    return filtered
  }

  function setPage(page: number) {
    currentPage.value = page
  }

  function setItemsPerPage(count: number) {
    itemsPerPage.value = count
  }

  const getProductFileName = (productId: number) => {
    if (!shopData.value?.products) return null

    const product = Object.values(shopData.value.products).find(
      prod => prod.id === productId,
    )

    return product?.file || null
  }

  return {
    findProduct,
    getProductFileName,
    filterProductsByTag,
    filterProductsByTags,
    searchedProducts,
    shopData,
    allProducts,
    paginatedProducts,
    totalPages,
    currentPage,
    itemsPerPage,
    totalItems: computedTotalItems,
    categoryFilter,
    sortBy,
    selectedTags,
    setPage,
    setItemsPerPage,
    setSortBy,
    addTag,
    removeTag,
    clearTags,
  }
})
