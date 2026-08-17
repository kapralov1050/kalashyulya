import { randomBytes } from 'node:crypto'
import type { Exhibition } from '~/types'
import { getDb } from '../../utils/db'
import { requireAuth } from '../../utils/requireAuth'

type CreateExhibitionBody = Partial<Omit<Exhibition, 'id' | 'status'>> & {
  title: string
  status?: Exhibition['status']
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const body = await readBody<CreateExhibitionBody>(event)
  if (!body?.title) {
    throw createError({ statusCode: 400, message: 'title обязателен' })
  }

  const id = randomBytes(8).toString('hex')
  const now = Date.now()
  const dbStatus = body.status === 'ongoing' ? 'published' : 'draft'

  getDb()
    .prepare(
      `INSERT INTO exhibitions
        (id, slug, title, tab_title, short_description,
         description_intro, description_body, description,
         date_start, date_end, date, date_range,
         location_venue, location_city, location_address, location_address_line,
         location_metro_json, location_map_link, location,
         cover_image, is_free, ticket_info, schedule_json, works_json,
         status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      body.slug ?? null,
      body.title,
      body.tabTitle ?? null,
      body.shortDescription ?? null,
      body.descriptionIntro ?? null,
      body.descriptionBody ?? null,
      [body.descriptionIntro, body.descriptionBody].filter(Boolean).join('\n\n') || null,
      body.dateStart ?? null,
      body.dateEnd ?? null,
      body.dateStart ?? null,
      body.dateRange ?? null,
      body.location?.venue ?? null,
      body.location?.city ?? null,
      body.location?.addressLine ?? null,
      body.location?.addressLine ?? null,
      JSON.stringify(body.location?.metro ?? []),
      body.location?.mapLink ?? null,
      [body.location?.venue, body.location?.city, body.location?.addressLine].filter(Boolean).join(', ') || null,
      body.coverImage ?? null,
      body.isFree ? 1 : 0,
      body.ticketInfo ?? null,
      JSON.stringify(body.schedule ?? []),
      JSON.stringify(body.works ?? []),
      dbStatus,
      now,
      now,
    )

  return { id }
})
