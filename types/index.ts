export interface Product {
  title: string
  description: string
  categoryId: string
  id: number
  image: string
  file: string
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
  phone?: string
  email: string
  userMessenger?: string[]
  userNickname?: string
  delivery?: {
    city: string
    recipient: string
    street: string
    house: string
    apartment: string
  }
}

export interface Order {
  customer: Omit<CustomerInfo, 'delivery'> & {
    delivery: {
      city: string
      recipient: string
      street: string
      house: string
      apartment: string
    }
  }
  purchase: {
    order: ShortPurchaseInfo[]
    createdAt: string
  }

  totalPrice: number
}

export interface DaDataSuggestion {
  value: string
  unrestricted_value: string
  data: {
    postal_code?: string
    city?: string
    street?: string
    house?: string
    flat?: string
  }
}

export type LessonsTags = Record<string, string>

export type DashBoardOption = 'NewProductForm' | 'ProductsList' | 'LocalesForm'

export interface TimelineItem {
  id: number
  year: string
  text: string
  Image: string
}
