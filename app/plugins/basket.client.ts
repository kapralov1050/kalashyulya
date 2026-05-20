export default defineNuxtPlugin(() => {
  const basketStore = useBasketStore()

  basketStore.loadPurchase()
})
