export interface Product {
  title: string
  description: string
  size: string
  material: string
  tecnic: string
  year: string
  categoryId: string
  id: number | string
  image: string[]
  file: string[]
  price: number
  stock: number
  tags: string[]
  isReserved?: boolean
  framing?: ('frame' | 'passepartout')[]
  certificateId?: string // Номер сертификата, если был сгенерирован
  views?: number
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
  id: number | string
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
    type: 'pickup' | 'delivery'
    city?: string
    recipient?: string
    address?: string
    // Legacy fields — kept for backward-compat with old Firebase records
    street?: string
    house?: string
    apartment?: string
  }
}

export interface Order {
  customer: Omit<CustomerInfo, 'delivery'> & {
    delivery: {
      type: 'pickup' | 'delivery'
      city?: string
      recipient?: string
      address?: string
      street?: string
      house?: string
      apartment?: string
    }
  }
  purchase: {
    order: ShortPurchaseInfo[]
    createdAt: string
  }
  totalPrice: number
  framing?: 'none' | 'simple' | 'premium'
  paymentMethod?: 'yookassa' | 'manual'
}

export interface OrderInBase extends Order {
  id: number
  status: string
  paymentId?: string
  paymentMethod?: 'yookassa' | 'manual'
  notificationFailed?: {
    telegram?: boolean
    email?: boolean
  }
}

export interface DaDataSuggestion {
  value: string
  unrestricted_value: string
  data: {
    postal_code?: string
    region?: string
    region_with_type?: string
    city?: string
    settlement?: string
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
  | 'CertificateGenerator'
  | 'NewExhibitionForm'
  | 'ExhibitionsManager'

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
  id?: number
  title: string
  subtitle?: string
  image?: string
  meta?: string
}

/**
 * DTO выставки. Совпадает с server/api/exhibitions.get.ts::ExhibitionDto 1:1.
 * Все опциональные поля могут быть пустой строкой / пустым массивом —
 * это нормализованное представление после SQLite-строки.
 */
export interface Exhibition {
  id: string
  slug: string
  tabTitle: string
  title: string
  shortDescription: string
  status: ExhibitionStatus
  dateRange: string
  dateStart?: string
  dateEnd?: string
  isFree?: boolean
  ticketInfo?: string
  coverImage: string
  schedule: ExhibitionScheduleDay[]
  location: ExhibitionLocation
  descriptionIntro: string
  descriptionBody: string
  works: ExhibitionWork[]
}

/**
 * DTO, возвращаемое /api/exhibitions. Структурно идентично Exhibition,
 * но алиас фиксирует границу client↔server.
 */
export type ExhibitionDto = Exhibition
