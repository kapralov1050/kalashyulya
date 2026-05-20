import type { Product } from '~/types'

export interface ItemVmInstance {
  handleBuy: () => void
  openProductPage: () => void
  isOrderModalOpen: boolean
  addToBasketAndOrder: (product: Product, shouldClear: boolean) => Promise<void>
  onOrderSuccess: (orderId: string) => void
  isOrderSuccessModalOpen: boolean
  lastOrderId: string
  modalProduct: Product | null
}

export interface ListVmInstance {
  handleBuyClick: (product: Product) => void
  handleTagClick: (tag: string) => void
  handlePageChange: (page: number) => Promise<void>
  addToBasketAndOrder: (product: Product, shouldClear: boolean) => Promise<void>
  onOrderSuccess: (orderId: string) => void
  isOrderModalOpen: boolean
  isOrderSuccessModalOpen: boolean
  lastOrderId: string
  modalProduct: Product | null
  handlePaymentMethod: (method: string) => Promise<void>
}

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
