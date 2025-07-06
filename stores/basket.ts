import type { Purchase, PurchaseParams } from '~/types'

export const useBasketStore = defineStore('basket', () => {
  const userPurchase = ref<Purchase[]>([])

  function loadPurchase() {
    const basketContent = localStorage.getItem('basket')
    if (basketContent) userPurchase.value = JSON.parse(basketContent)
  }

  function addShopItemToBasket(item: PurchaseParams): void {
    const index = userPurchase.value.findIndex(pos => item.id === pos.item.id)

    if (index !== -1) {
      userPurchase.value[index].amount = 1
    } else {
      userPurchase.value.push({
        amount: 1,
        item,
      })
    }

    localStorage.setItem('basket', JSON.stringify(userPurchase.value))
  }

  function changeShopItemQty(changeVal: number, item: PurchaseParams) {
    const desiredIndex = userPurchase.value.findIndex(
      pos => item.id === pos.item.id,
    )
    const currentItem = userPurchase.value[desiredIndex]
    const newAmount = currentItem.amount + changeVal
    if (newAmount <= 0) {
      userPurchase.value = userPurchase.value.filter((_, index) => {
        return index !== desiredIndex
      })
    } else if (newAmount <= item.stock) {
      currentItem.amount = newAmount
    }

    localStorage.setItem('basket', JSON.stringify(userPurchase.value))
  }

  return {
    userPurchase,
    addShopItemToBasket,
    changeShopItemQty,
    loadPurchase,
  }
})
