import { defineStore } from 'pinia'
import type { Product } from '~/types'
import { useApi } from '~/composables/useApi'

export const useShopStore = defineStore('shop', () => {
  const api = useApi()

  const searchedProducts = ref<Product[] | null>(null)
  const categoryFilter = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(12)
  const sortBy = ref<string>('default')
  const selectedTags = ref<string[]>([])
  const framingFilter = ref<'all' | 'none' | 'hasFraming'>('all')

  watch(categoryFilter, (newValue, oldValue) => {
    if (oldValue !== undefined) {
      searchedProducts.value = null
      currentPage.value = 1
    }
  })

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

  const allProducts = computed<Product[]>(() => {
    const products = Object.values(api.shopData.value?.products ?? {})
    let filtered = products

    if (categoryFilter.value) {
      filtered = filtered.filter(prod => prod.categoryId === categoryFilter.value)
    }
    if (selectedTags.value.length > 0) {
      filtered = filtered.filter(prod =>
        selectedTags.value.every(tag => prod.tags?.includes(tag)),
      )
    }
    if (framingFilter.value === 'none') {
      filtered = filtered.filter(prod => !prod.framing || prod.framing.length === 0)
    } else if (framingFilter.value === 'hasFraming') {
      filtered = filtered.filter(prod => prod.framing && prod.framing.length > 0)
    }

    filtered = filtered.filter(prod => prod.stock > 0 || prod.isReserved === true)
    return sortProducts(filtered)
  })

  const paginatedProducts = computed(() => {
    const source = searchedProducts.value && searchedProducts.value.length > 0
      ? [...searchedProducts.value]
      : allProducts.value

    const sorted = sortProducts(source)
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return [...sorted.slice(start, end)]
  })

  const computedTotalItems = computed(() => {
    if (searchedProducts.value && searchedProducts.value.length > 0) {
      return searchedProducts.value.length
    }
    return allProducts.value.length
  })

  const totalPages = computed(() =>
    Math.ceil(computedTotalItems.value / itemsPerPage.value),
  )

  const findProduct = (searchQry: string) =>
    allProducts.value.filter(prod =>
      prod.title.toLowerCase().includes(searchQry.toLowerCase()),
    )

  function setSortBy(sort: string) {
    sortBy.value = sort
    currentPage.value = 1
  }

  function addTag(tag: string) {
    if (!selectedTags.value.includes(tag)) selectedTags.value.push(tag)
  }

  function removeTag(tag: string) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  }

  function clearTags() { selectedTags.value = [] }

  function setFramingFilter(filter: 'all' | 'none' | 'hasFraming') {
    framingFilter.value = filter
    currentPage.value = 1
    searchedProducts.value = null
  }

  function filterProductsByTag(tag: string) {
    addTag(tag)
    return filterProductsByTags()
  }

  function filterProductsByTags() {
    const filtered = allProducts.value.filter(prod =>
      selectedTags.value.every(tag => prod.tags?.includes(tag)),
    )
    searchedProducts.value = filtered
    currentPage.value = 1
    return filtered
  }

  function setPage(page: number) { currentPage.value = page }
  function setItemsPerPage(count: number) { itemsPerPage.value = count }

  function getProductFileName(productId: string | number) {
    const product = Object.values(api.shopData.value?.products ?? {}).find(
      prod => String(prod.id) === String(productId),
    )
    return product?.file || null
  }

  const isLoading = computed(() => Object.keys(api.shopData.value?.products ?? {}).length === 0)

  async function loadProducts() {
    await api.loadProducts()
  }

  return {
    findProduct,
    getProductFileName,
    filterProductsByTag,
    filterProductsByTags,
    searchedProducts,
    shopData: api.shopData,
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
    framingFilter,
    setFramingFilter,
    isLoading,
    loadProducts,
  }
})