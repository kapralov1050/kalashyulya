export interface Product {
  title: string
  description: string
  size: string
  material: string
  tecnic: string
  year: string
  categoryId: string
  id: number
  image: string[]
  file: string[]
  price: number
  stock: number
  tags: string[]
  arModel?: string // Опциональная AR-модель (GLB/GLTF) для просмотра в пространстве
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
  userMessenger?: string
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

export interface OrderInBase extends Order {
  id: number
  status: string
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

export type DashBoardOption =
  | 'NewProductForm'
  | 'ProductsList'
  | 'LocalesForm'
  | 'OrdersList'
  | 'StatsDashboard'

export interface TimelineItem {
  id: number
  year: string
  text: string
  Image: string
}

export type ExhibitionStatus = 'planned' | 'ongoing' | 'finished'

export interface ExhibitionScheduleDay {
  id: string
  label: string
  time: string
  isClosed?: boolean
}

export interface ExhibitionLocation {
  venue: string
  city: string
  addressLine: string
  metro: string[]
  mapLink: string
}

export interface ExhibitionWork {
  id: number
  title: string
  subtitle?: string
  image: string
  meta?: string
}

export interface Exhibition {
  id: number
  slug: string
  tabTitle: string
  title: string
  shortDescription: string
  status: ExhibitionStatus
  dateRange: string
  coverImage: string
  schedule: ExhibitionScheduleDay[]
  location: ExhibitionLocation
  descriptionIntro: string
  descriptionBody: string
  works: ExhibitionWork[]
}

// Firebase

export type ExhibitionsData = Record<string, any>
