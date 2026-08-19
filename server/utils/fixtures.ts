/**
 * Fixture helper для Vercel preview (UI-only).
 *
 * На VPS prod работает реальная SQLite (server/utils/db.ts).
 * На Vercel SQLite не запускается (read-only FS, native binding),
 * поэтому endpoints читают статичные fixtures из server/fixtures/*.json.
 *
 * Фикстуры генерируются вручную через скрипт scripts/export-fixtures.cjs
 * (curl на прод-API). Эти данные — копия текущего prod, безопасны
 * (нет PII — только публичные товары/категории/выставки).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const FIXTURES_DIR = join(process.cwd(), 'server/fixtures')

export function isVercelPreview(): boolean {
  return !!process.env.VERCEL
}

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(FIXTURES_DIR, name), 'utf-8')) as T
}

export interface ProductFixture {
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

export interface CategoryFixture {
  id: string
  name: string
  order: number
}

export interface ExhibitionFixture {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  description: string | null
  date: string | null
  dateEnd: string | null
  dateRange: string | null
  coverImage: string | null
  location: {
    venue: string | null
    city: string | null
    addressLine: string | null
    address: string | null
    metro: string[]
    mapLink: string | null
  } | null
  isFree: boolean
  ticketInfo: string | null
  schedule: unknown[]
  works: unknown[]
  shortDescription: string | null
}

export function getFixturesProducts(): ProductFixture[] {
  return readJson<{ products: ProductFixture[] }>('products.json').products
}

export function getFixturesCategories(): CategoryFixture[] {
  return readJson<{ categories: CategoryFixture[] }>('categories.json').categories
}

export function getFixturesExhibitions(): ExhibitionFixture[] {
  return readJson<{ exhibitions: ExhibitionFixture[] }>('exhibitions.json').exhibitions
}