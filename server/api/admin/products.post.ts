import { randomBytes } from 'node:crypto'
import { getDb } from '../../utils/db'
import { requireAuth } from '../../utils/requireAuth'

interface CreateProductBody {
  title: string
  price: number
  description?: string | null
  size?: string | null
  material?: string | null
  tecnic?: string | null
  year?: number | null
  stock?: number
  views?: number
  certificateId?: string | null
  isReserved?: boolean
  status?: 'available' | 'sold' | 'reserved'
  categoryId?: string | null
  image?: string[]
  file?: string[]
  tags?: string[]
  framing?: ('frame' | 'passepartout')[]
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const body = await readBody<CreateProductBody>(event)

  if (!body?.title || typeof body.price !== 'number') {
    throw createError({ statusCode: 400, message: 'title и price обязательны' })
  }

  const id = randomBytes(8).toString('hex')
  const now = Date.now()
  const status = body.status
    ?? (body.isReserved ? 'reserved' : (typeof body.stock === 'number' && body.stock <= 0 ? 'sold' : 'available'))

  getDb()
    .prepare(
      `INSERT INTO products
        (id, title, description, size, material, tecnic, year, price, stock, views,
         certificate_id, is_reserved, status, category_id, images, files, tags, framing,
         created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      body.title,
      body.description ?? null,
      body.size ?? null,
      body.material ?? null,
      body.tecnic ?? null,
      body.year ?? null,
      body.price,
      body.stock ?? 0,
      body.views ?? 0,
      body.certificateId ?? null,
      body.isReserved ? 1 : 0,
      status,
      body.categoryId ?? null,
      JSON.stringify(body.image ?? []),
      JSON.stringify(body.file ?? []),
      JSON.stringify(body.tags ?? []),
      JSON.stringify(body.framing ?? []),
      now,
      now,
    )

  return { id }
})