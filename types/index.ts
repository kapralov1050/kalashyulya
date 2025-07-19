export interface Product {
  category: string
  categoryId: number
  id: number
  title: string
  description: string
  price: number
  image: string
  stock: number
  tags: string[]
}

export interface ProductCategory {
  id: number
  name: string
  category: string
  items: Product[]
}

export type ShopData = ProductCategory[]

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
