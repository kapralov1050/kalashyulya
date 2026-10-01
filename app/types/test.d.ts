import type { Product } from '~/types'

export interface BasketVmInstance {
  isOrderModalOpen: boolean
  orderCreated: boolean
  currentOrderId: string
  savedAmount: number
  modalTitle: string
  purchaseButtonText: string
  startOrder: () => void
  handleOrderCreated: (orderId: string) => void
  handlePaymentMethod: (method: string) => Promise<void>
  deleteShopItemFromBasket: (product: Product) => void
  decreaseAmount: (product: Product) => void
  increaseAmount: (product: Product) => void
}

export interface OrderFormVmInstance {
  isFormValid: boolean
  isSending: boolean
  isDelivery: boolean
  formData: {
    name: string
    phone: string
    email: string
    city: string
    recipient: string
    street: string
    house: string
    apartment: string
    nickname: string
  }
  messengerType: string[]
  submitOrder: () => Promise<void>
}
