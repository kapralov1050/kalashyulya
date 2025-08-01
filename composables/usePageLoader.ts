export const usePageLoader = () => {
  const isLoading = ref(false)

  const startLoader = () => {
    isLoading.value = true
    nextTick(() => {
      setTimeout(() => {
        isLoading.value = false
      }, 2000)
    })
  }

  return {
    startLoader,
    isLoading,
  }
}
