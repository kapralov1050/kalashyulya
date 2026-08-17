import { getDb } from '../utils/db'

interface ProductRow {
  id: string
  title: string
  description: string | null
  size: string | null
  material: string | null
  tecnic: string | null
  year: number | null
  price: number
  stock: number
  views: number
  certificate_id: string | null
  is_reserved: number
  status: 'available' | 'sold' | 'reserved'
  category_id: string | null
  images: string
  files: string
  tags: string
  framing: string
  created_at: number
  updated_at: number
}

export interface ProductDto {
  id: string
  title: string
  description: string | null
  size: string | null
  material: string | null
  tecnic: string | null
  year: number | null
  price: number
  stock: number
  views: number
  certificateId: string | null
  isReserved: boolean
  status: 'available' | 'sold' | 'reserved'
  categoryId: string | null
  image: string[]
  file: string[]
  tags: string[]
  framing: ('frame' | 'passepartout')[]
  createdAt: number
  updatedAt: number
}

export default defineEventHandler((): ProductDto[] => {
  const db = getDb()
  const rows = db
    .prepare('SELECT * FROM products ORDER BY created_at DESC')
    .all() as ProductRow[]

  return rows.map((r): ProductDto => ({
    id: r.id,
    title: r.title,
    description: r.description,
    size: r.size,
    material: r.material,
    tecnic: r.tecnic,
    year: r.year,
    price: r.price,
    stock: r.stock,
    views: r.views,
    certificateId: r.certificate_id,
    isReserved: r.is_reserved === 1,
    status: r.status,
    categoryId: r.category_id,
    image: JSON.parse(r.images || '[]'),
    file: JSON.parse(r.files || '[]'),
    tags: JSON.parse(r.tags || '[]'),
    framing: JSON.parse(r.framing || '[]'),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
})