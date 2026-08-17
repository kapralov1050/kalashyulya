import { randomBytes } from 'node:crypto'
import { getDb } from '../../utils/db'
import { requireAuth } from '../../utils/requireAuth'

interface CreateExhibitionBody {
  title: string
  description?: string
  date?: string
  location?: string
  coverImage?: string
  status?: 'draft' | 'published'
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const body = await readBody<CreateExhibitionBody>(event)
  if (!body?.title) {
    throw createError({ statusCode: 400, message: 'title обязателен' })
  }

  const id = randomBytes(8).toString('hex')
  const now = Date.now()

  getDb()
    .prepare(
      `INSERT INTO exhibitions
        (id, title, description, date, location, cover_image, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      body.title,
      body.description ?? null,
      body.date ?? null,
      body.location ?? null,
      body.coverImage ?? null,
      body.status ?? 'draft',
      now,
      now,
    )

  return { id }
})