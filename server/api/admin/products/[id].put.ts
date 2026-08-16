import { getDb } from '../../../utils/db'
import { requireAuth } from '../../../utils/requireAuth'

interface UpdateProductBody {
  title?: string
  price?: number
  year?: number | null
  materials?: string[]
  images?: string[]
  status?: 'available' | 'sold' | 'reserved'
  category?: string | null
  description?: string | null
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id обязателен' })

  const body = await readBody<UpdateProductBody>(event)
  const fields: string[] = []
  const values: unknown[] = []

  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title) }
  if (body.price !== undefined) { fields.push('price = ?'); values.push(body.price) }
  if (body.year !== undefined) { fields.push('year = ?'); values.push(body.year) }
  if (body.materials !== undefined) { fields.push('materials = ?'); values.push(JSON.stringify(body.materials)) }
  if (body.images !== undefined) { fields.push('images = ?'); values.push(JSON.stringify(body.images)) }
  if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status) }
  if (body.category !== undefined) { fields.push('category = ?'); values.push(body.category) }
  if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description) }

  if (fields.length === 0) {
    throw createError({ statusCode: 400, message: 'Нет полей для обновления' })
  }

  fields.push('updated_at = ?')
  values.push(Date.now())
  values.push(id)

  const info = getDb()
    .prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`)
    .run(...(values as (string | number | null)[]))

  if (info.changes === 0) {
    throw createError({ statusCode: 404, message: 'Товар не найден' })
  }

  return { ok: true }
})