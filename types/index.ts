export interface Product {
  title: string
  description: string
  categoryId: string
  id: number
  image: string
  price: number
  stock: number
  tags: string[]
}

export interface ShopData {
  categories: Record<string, string | number>
  products: Record<string, Product>
}

export interface Purchase {
  amount: number
  item: PurchaseParams
}

export type PurchaseParams = Omit<
  Product,
  'description' | 'categoryId' | 'tags'
>

export interface ShortPurchaseInfo {
  amount: number
  title: string
  price: number
}

export interface CustomerInfo {
  name: string
  phone: string
  email: string
  address: string
  comment: string
}

export interface Order {
  customer: CustomerInfo
  purchase: {
    order: ShortPurchaseInfo[]
    createdAt: string
  }
  totalPrice: number
}
