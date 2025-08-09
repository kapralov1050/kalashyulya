export const usePageLoader = () => {
  const isLoading = shallowRef(false)

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
