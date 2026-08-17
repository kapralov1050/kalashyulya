import type { Exhibition } from '~/types'
import { getDb } from '../../../utils/db'
import { requireAuth } from '../../../utils/requireAuth'

type UpdateExhibitionBody = Partial<Omit<Exhibition, 'id'>> & {
  // Legacy-поля из старого минимального DTO (description/date — алиасы).
  description?: string | null
  date?: string | null
  // Серверный DTO может слать 'published'/'draft', фронт шлёт ExhibitionStatus.
  status?: Exhibition['status'] | 'published' | 'draft'
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id обязателен' })

  const body = await readBody<UpdateExhibitionBody>(event)
  const fields: string[] = []
  const values: unknown[] = []

  if (body.slug !== undefined) { fields.push('slug = ?'); values.push(body.slug) }
  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title) }
  if (body.tabTitle !== undefined) { fields.push('tab_title = ?'); values.push(body.tabTitle) }
  if (body.shortDescription !== undefined) { fields.push('short_description = ?'); values.push(body.shortDescription) }
  if (body.descriptionIntro !== undefined) {
    fields.push('description_intro = ?'); values.push(body.descriptionIntro)
  }
  if (body.descriptionBody !== undefined) {
    fields.push('description_body = ?'); values.push(body.descriptionBody)
  }
  if ((body.descriptionIntro !== undefined || body.descriptionBody !== undefined) && body.description === undefined) {
    // Пересчитать legacy concat из изменённых частей (без null-ов, иначе затрём существующее).
    const intro = body.descriptionIntro ?? ''
    const bodyText = body.descriptionBody ?? ''
    if (intro || bodyText) {
      fields.push('description = ?'); values.push([intro, bodyText].filter(Boolean).join('\n\n'))
    }
  }
  if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description) }
  if (body.dateStart !== undefined) { fields.push('date_start = ?'); values.push(body.dateStart) }
  if (body.dateEnd !== undefined) { fields.push('date_end = ?'); values.push(body.dateEnd) }
  if (body.date !== undefined) { fields.push('date = ?'); values.push(body.date) }
  if (body.dateRange !== undefined) { fields.push('date_range = ?'); values.push(body.dateRange) }
  if (body.location !== undefined) {
    const loc = body.location
    fields.push('location_venue = ?'); values.push(loc.venue ?? null)
    fields.push('location_city = ?'); values.push(loc.city ?? null)
    fields.push('location_address_line = ?'); values.push(loc.addressLine ?? null)
    fields.push('location_address = ?'); values.push(loc.addressLine ?? null)
    fields.push('location_metro_json = ?'); values.push(JSON.stringify(loc.metro ?? []))
    fields.push('location_map_link = ?'); values.push(loc.mapLink ?? null)
    fields.push('location = ?')
    values.push(
      [loc.venue, loc.city, loc.addressLine].filter(Boolean).join(', ') || null,
    )
  }
  if (body.coverImage !== undefined) { fields.push('cover_image = ?'); values.push(body.coverImage) }
  if (body.isFree !== undefined) { fields.push('is_free = ?'); values.push(body.isFree ? 1 : 0) }
  if (body.ticketInfo !== undefined) { fields.push('ticket_info = ?'); values.push(body.ticketInfo) }
  if (body.schedule !== undefined) {
    fields.push('schedule_json = ?'); values.push(JSON.stringify(body.schedule))
  }
  if (body.works !== undefined) { fields.push('works_json = ?'); values.push(JSON.stringify(body.works)) }
  if (body.status !== undefined) {
    const incoming = body.status as string
    const dbStatus = (incoming === 'ongoing' || incoming === 'published') ? 'published' : 'draft'
    fields.push('status = ?'); values.push(dbStatus)
  }

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
