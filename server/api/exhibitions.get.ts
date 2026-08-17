import { getDb } from '../utils/db'

interface ExhibitionRow {
  id: string
  title: string
  description: string | null
  date: string | null
  location: string | null
  cover_image: string | null
  status: 'draft' | 'published'
  created_at: number
  updated_at: number
}

export interface ExhibitionDto {
  id: string
  title: string
  description: string | null
  date: string | null
  location: string | null
  coverImage: string | null
  status: ExhibitionRow['status']
  createdAt: number
  updatedAt: number
}

export default defineEventHandler((event): ExhibitionDto[] => {
  const status = getQuery(event).status as string | undefined
  const sql = status
    ? 'SELECT * FROM exhibitions WHERE status = ? ORDER BY created_at DESC'
    : 'SELECT * FROM exhibitions ORDER BY created_at DESC'
  const rows = (status
    ? getDb().prepare(sql).all(status)
    : getDb().prepare(sql).all()) as ExhibitionRow[]

  return rows.map((r): ExhibitionDto => ({
    id: r.id,
    title: r.title,
    description: r.description,
    date: r.date,
    location: r.location,
    coverImage: r.cover_image,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
})