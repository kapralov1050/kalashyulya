import { getDb } from '../../../utils/db'
import { requireAuth } from '../../../utils/requireAuth'

interface UpdateProductBody {
  title?: string
  description?: string | null
  size?: string | null
  material?: string | null
  tecnic?: string | null
  year?: number | null
  price?: number
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
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id обязателен' })

  const body = await readBody<UpdateProductBody>(event)
  const fields: string[] = []
  const values: unknown[] = []

  const set = (col: string, val: unknown) => { fields.push(`${col} = ?`); values.push(val) }

  if (body.title !== undefined) set('title', body.title)
  if (body.description !== undefined) set('description', body.description)
  if (body.size !== undefined) set('size', body.size)
  if (body.material !== undefined) set('material', body.material)
  if (body.tecnic !== undefined) set('tecnic', body.tecnic)
  if (body.year !== undefined) set('year', body.year)
  if (body.price !== undefined) set('price', body.price)
  if (body.stock !== undefined) set('stock', body.stock)
  if (body.views !== undefined) set('views', body.views)
  if (body.certificateId !== undefined) set('certificate_id', body.certificateId)
  if (body.isReserved !== undefined) set('is_reserved', body.isReserved ? 1 : 0)
  if (body.status !== undefined) set('status', body.status)
  if (body.categoryId !== undefined) set('category_id', body.categoryId)
  if (body.image !== undefined) set('images', JSON.stringify(body.image))
  if (body.file !== undefined) set('files', JSON.stringify(body.file))
  if (body.tags !== undefined) set('tags', JSON.stringify(body.tags))
  if (body.framing !== undefined) set('framing', JSON.stringify(body.framing))

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