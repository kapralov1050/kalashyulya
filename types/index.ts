export interface Purchase {
  amount: number
  item: PurchaseParams
}

export type PurchaseParams = Omit<Product, 'description'>

export interface Product {
  id: number
  title: string
  description: string
  price: number
  category: string
  image: string
  stock: number
}
