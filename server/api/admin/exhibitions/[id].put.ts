import { getDb } from '../../../utils/db'
import { requireAuth } from '../../../utils/requireAuth'

interface UpdateExhibitionBody {
  title?: string
  description?: string | null
  date?: string | null
  location?: string | null
  coverImage?: string | null
  status?: 'draft' | 'published'
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id обязателен' })

  const body = await readBody<UpdateExhibitionBody>(event)
  const fields: string[] = []
  const values: unknown[] = []

  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title) }
  if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description) }
  if (body.date !== undefined) { fields.push('date = ?'); values.push(body.date) }
  if (body.location !== undefined) { fields.push('location = ?'); values.push(body.location) }
  if (body.coverImage !== undefined) { fields.push('cover_image = ?'); values.push(body.coverImage) }
  if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status) }

  if (fields.length === 0) {
    throw createError({ statusCode: 400, message: 'Нет полей для обновления' })
  }

  fields.push('updated_at = ?')
  values.push(Date.now())
  values.push(id)

  const info = getDb()
    .prepare(`UPDATE exhibitions SET ${fields.join(', ')} WHERE id = ?`)
    .run(...(values as (string | number | null)[]))

  if (info.changes === 0) {
    throw createError({ statusCode: 404, message: 'Выставка не найдена' })
  }

  return { ok: true }
})