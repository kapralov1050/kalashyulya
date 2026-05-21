export const usePageLoader = () => {
  const isLoading = shallowRef(false)

  const startLoader = () => {
    isLoading.value = true
    nextTick(() => {
      setTimeout(() => {
        isLoading.value = false
      }, 1300)
    })
  }

  return {
    startLoader,
    isLoading,
  }
}
