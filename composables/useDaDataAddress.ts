import { debounce } from 'lodash-es'
import { ref } from 'vue'
import type { DaDataSuggestion } from '~/types'

const DADATA_API_URL =
  'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address'
const DEBOUNCE_TIME = 300

export function useDaDataAddress() {
  const suggestions = ref<DaDataSuggestion[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const config = useRuntimeConfig()

  const fetchAddresses = debounce(async (query: string) => {
    if (typeof query !== 'string' || !query.trim()) {
      console.log('test')
      suggestions.value = []
      return
    }

    const trimmedQuery = query.trim()
    if (trimmedQuery.length < 2) {
      // Минимум 2 символа для поиска
      suggestions.value = []
      return
    }

    isLoading.value = true
    error.value = null

    console.log('Starting DaData request with query:', query)
    console.log('Using API key:', config.public.dadataApiKey)
    try {
      const response = await fetch(DADATA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Token ${config.public.dadataApiKey}`,
          'X-Secret': config.public.dadataSecretKey as string,
        },
        body: JSON.stringify({ query, count: 10 }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      suggestions.value = data.suggestions || []
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch addresses'
      suggestions.value = []
    } finally {
      isLoading.value = false
    }
  }, DEBOUNCE_TIME)

  const selectAddress = (suggestion: DaDataSuggestion) => {
    suggestions.value = []
    return suggestion.data
  }

  return {
    suggestions,
    isLoading,
    error,
    fetchAddresses,
    selectAddress,
  }
}
