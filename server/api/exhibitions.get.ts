import type { Exhibition } from '~/types'
import { getDb } from '../utils/db'
import { exhibitionStatusToDto, safeJsonParse } from '../../scripts/migration-mappers'

interface ExhibitionRow {
  id: string
  slug: string | null
  title: string
  tab_title: string | null
  short_description: string | null
  description_intro: string | null
  description_body: string | null
  description: string | null
  date_start: string | null
  date_end: string | null
  date: string | null
  date_range: string | null
  location_venue: string | null
  location_city: string | null
  location_address: string | null
  location_address_line: string | null
  location_metro_json: string | null
  location_map_link: string | null
  location: string | null
  cover_image: string | null
  is_free: number
  ticket_info: string | null
  schedule_json: string | null
  works_json: string | null
  status: 'draft' | 'published'
  created_at: number
  updated_at: number
}

export type ExhibitionDto = Exhibition

function rowToDto(r: ExhibitionRow): ExhibitionDto {
  return {
    id: r.id,
    slug: r.slug ?? '',
    tabTitle: r.tab_title ?? r.title ?? '',
    title: r.title,
    shortDescription: r.short_description ?? '',
    status: exhibitionStatusToDto(r.status, r.date_end),
    dateRange: r.date_range ?? '',
    dateStart: r.date_start ?? r.date ?? undefined,
    dateEnd: r.date_end ?? undefined,
    isFree: !!r.is_free,
    ticketInfo: r.ticket_info ?? undefined,
    coverImage: r.cover_image ?? '',
    schedule: safeJsonParse<Exhibition['schedule']>(r.schedule_json, []),
    location: {
      venue: r.location_venue ?? '',
      city: r.location_city ?? '',
      addressLine: r.location_address_line ?? r.location_address ?? '',
      metro: safeJsonParse<string[]>(r.location_metro_json, []),
      mapLink: r.location_map_link ?? '',
    },
    descriptionIntro: r.description_intro ?? '',
    descriptionBody: r.description_body ?? '',
    works: safeJsonParse<Exhibition['works']>(r.works_json, []),
  }
}

export default defineEventHandler((event): ExhibitionDto[] => {
  const status = getQuery(event).status as string | undefined
  const sql = status
    ? 'SELECT * FROM exhibitions WHERE status = ? ORDER BY created_at DESC'
    : 'SELECT * FROM exhibitions ORDER BY created_at DESC'
  const rows = (status
    ? getDb().prepare(sql).all(status)
    : getDb().prepare(sql).all()) as ExhibitionRow[]

  return rows.map(rowToDto)
})
