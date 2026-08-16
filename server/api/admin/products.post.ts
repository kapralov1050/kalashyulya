import { randomBytes } from 'node:crypto'
import { getDb } from '../../utils/db'
import { requireAuth } from '../../utils/requireAuth'

interface CreateProductBody {
  title: string
  price: number
  year?: number
  materials?: string[]
  images?: string[]
  status?: 'available' | 'sold' | 'reserved'
  category?: string
  description?: string
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const body = await readBody<CreateProductBody>(event)

  if (!body?.title || typeof body.price !== 'number') {
    throw createError({ statusCode: 400, message: 'title и price обязательны' })
  }

  const id = randomBytes(8).toString('hex')
  const now = Date.now()

  getDb()
    .prepare(
      `INSERT INTO products
        (id, title, price, year, materials, images, status, category, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      body.title,
      body.price,
      body.year ?? null,
      JSON.stringify(body.materials ?? []),
      JSON.stringify(body.images ?? []),
      body.status ?? 'available',
      body.category ?? null,
      body.description ?? null,
      now,
      now,
    )

  return { id }
})