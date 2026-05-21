export interface MapRegion {
  ident: string
  name: string
  paths: string[]
  polygons: string[]
}

// Синглтон — данные грузятся один раз на всё приложение
const _regions = ref<MapRegion[]>([])
const _loaded = ref(false)
const _loading = ref(false)

export function useRussiaMap() {
  async function loadRegions() {
    if (_loaded.value || _loading.value) return
    _loading.value = true
    try {
      const data = await $fetch<{ regions: MapRegion[] }>('/data/russia-regions.json')
      _regions.value = data.regions
      _loaded.value = true
    }
    finally {
      _loading.value = false
    }
  }

  return {
    regions: _regions,
    loading: _loading,
    loadRegions,
  }
}
