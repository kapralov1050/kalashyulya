import { getDb } from '../utils/db'

interface ProductRow {
  id: string
  title: string
  price: number
  year: number | null
  materials: string | null
  images: string | null
  status: 'available' | 'sold' | 'reserved'
  category: string | null
  description: string | null
  created_at: number
  updated_at: number
}

export interface ProductDto {
  id: string
  title: string
  price: number
  year: number | null
  materials: string[]
  images: string[]
  status: ProductRow['status']
  category: string | null
  description: string | null
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
    price: r.price,
    year: r.year,
    materials: JSON.parse(r.materials || '[]'),
    images: JSON.parse(r.images || '[]'),
    status: r.status,
    category: r.category,
    description: r.description,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
})
