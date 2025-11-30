import type { Purchase, PurchaseParams, ShortPurchaseInfo } from '~/types'

export const useBasketStore = defineStore('basket', () => {
  const shoppingCart = ref<Purchase[]>([])

  const totalPurchaseAmount = computed(() => {
    return shoppingCart.value.reduce((acc, purc) => (acc += purc.item.price), 0)
  })

  const totalPurchaceQty = computed(() => {
    return shoppingCart.value.length
  })

  const shortPurchaseInfo = computed<ShortPurchaseInfo[]>(() => {
    return shoppingCart.value.map(purc => {
      const shortInfo = {
        amount: purc.amount,
        title: purc.item.title,
        price: purc.item.price,
      }

      return shortInfo
    })
  })

  function loadPurchase() {
    const basketContent = localStorage.getItem('basket')
    if (basketContent) shoppingCart.value = JSON.parse(basketContent)
  }

  function addShopItemToBasket(userPurchase: Purchase): void {
    const index = shoppingCart.value.findIndex(
      (prod: Purchase) => userPurchase.item.id === prod.item.id,
    )
    if (index === -1) {
      shoppingCart.value.push(userPurchase)
    }
    localStorage.setItem('basket', JSON.stringify(shoppingCart.value))
  }

  function deleteShopItemFromBasket(item: PurchaseParams) {
    shoppingCart.value = shoppingCart.value.filter(
      (prod: Purchase) => prod.item.id !== item.id,
    )
    localStorage.setItem('basket', JSON.stringify(shoppingCart.value))
  }

  function changeShopItemQty(changeVal: number, item: PurchaseParams) {
    const desiredIndex = shoppingCart.value.findIndex(
      (prod: Purchase) => item.id === prod.item.id,
    )
    const currentItem = shoppingCart.value[desiredIndex]
    const newAmount = currentItem.amount + changeVal
    if (newAmount <= 0) {
      shoppingCart.value = shoppingCart.value.filter(
        (_: unknown, index: number) => {
          return index !== desiredIndex
        },
      )
    } else if (newAmount <= item.stock) {
      currentItem.amount = newAmount
    }
    localStorage.setItem('basket', JSON.stringify(shoppingCart.value))
  }

  function clearBasket() {
    shoppingCart.value = []
    localStorage.removeItem('basket')
  }

  return {
    shoppingCart,
    deleteShopItemFromBasket,
    addShopItemToBasket,
    changeShopItemQty,
    loadPurchase,
    clearBasket,
    totalPurchaseAmount,
    totalPurchaceQty,
    shortPurchaseInfo,
  }
})
