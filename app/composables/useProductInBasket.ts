import { computed } from 'vue'
import { storeToRefs } from 'pinia'

/**
 * Composable для проверки наличия товара в корзине
 * @param productId - ID товара для проверки
 * @returns объект с computed свойством isInBasket
 */
export const useProductInBasket = (productId: string | number) => {
  const { shoppingCart } = storeToRefs(useBasketStore())

  const isInBasket = computed(() => {
    if (!shoppingCart.value) return false
    return shoppingCart.value.some(
      el => el.item.id.toString() === productId.toString(),
    )
  })

  return { isInBasket }
}
