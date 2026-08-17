/**
 * Тесты DTO-маппинга в server/api/exhibitions.get.ts.
 *
 * Цель — зафиксировать контракт между SQLite-строкой (002_exhibitions.sql)
 * и Exhibition-shaped JSON, который ждут фронтовые компоненты
 * (/exhibitions/[slug], ExhibitionCard, ExhibitionScheduleAddress, ExhibitionGallery).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const TEST_DIR = resolve(process.cwd(), 'tmp-server-tests')
const TEST_DB = resolve(TEST_DIR, 'test-exhibitions.db')

beforeAll(() => {
  mkdirSync(TEST_DIR, { recursive: true })
  process.env.SQLITE_PATH = TEST_DB
  process.env.NODE_ENV = 'test'
})

afterAll(() => {
  rmSync(TEST_DIR, { recursive: true, force: true })
})

describe('exhibitions.get DTO mapping', () => {
  let getDb: typeof import('../../utils/db').getDb
  let closeDb: typeof import('../../utils/db').closeDb
  let exhibitionsGetHandler: typeof import('../exhibitions.get').default

  beforeAll(async () => {
    const dbModule = await import('../../utils/db')
    getDb = dbModule.getDb
    closeDb = dbModule.closeDb

    // Схема применяется автоматически через getDb() → applyMigrations().
    // НЕ вызываем exec повторно — applyAlterFile идемпотентна через table_info,
    // но прямой exec не идемпотентен и упадёт на duplicate column.

    // Сидим одну выставку со всеми полями
    const now = Date.now()
    getDb().prepare(`
      INSERT INTO exhibitions (
        id, slug, title, tab_title, short_description,
        description_intro, description_body, description,
        date_start, date_end, date, date_range,
        location_venue, location_city, location_address, location_address_line,
        location_metro_json, location_map_link, location,
        cover_image, is_free, ticket_info, schedule_json, works_json,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'ex_1',
      'tikhij-svet-zimy',
      'Выставка «Тихий свет зимы»',
      'Тихий свет зимы — выставка',
      'Короткое описание',
      'Intro текст',
      'Body текст',
      'Intro текст\n\nBody текст',
      '2025-01-10',
      '2025-02-15',
      '2025-01-10',
      '10 января — 15 февраля 2025',
      'Галерея «Север»',
      'Москва',
      'Москва, ул. Тверская, 1',
      'ул. Тверская, 1',
      JSON.stringify(['Тверская', 'Пушкинская']),
      'https://yandex.ru/maps/?text=...',
      'legacy location',
      'https://example.com/cover.jpg',
      1,
      'Вход свободный',
      JSON.stringify([
        { id: 'mon', label: 'Понедельник', time: '10:00–19:00' },
        { id: 'tue', label: 'Вторник', time: 'Закрыто', isClosed: true },
      ]),
      JSON.stringify([
        { id: 1, title: 'Зимний лес', image: 'forest.jpg' },
      ]),
      'published',
      now,
      now,
    )

    exhibitionsGetHandler = (await import('../exhibitions.get')).default
  })

  afterAll(() => {
    closeDb()
  })

  it('возвращает выставку в формате ExhibitionDto (camelCase)', async () => {
    const fakeEvent = { context: {} } as unknown as Parameters<typeof exhibitionsGetHandler>[0]
    const result = await exhibitionsGetHandler(fakeEvent)

    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(1)

    const ex = result[0]!
    expect(ex.id).toBe('ex_1')
    expect(ex.slug).toBe('tikhij-svet-zimy')
    expect(ex.tabTitle).toBe('Тихий свет зимы — выставка')
    expect(ex.title).toBe('Выставка «Тихий свет зимы»')
    expect(ex.shortDescription).toBe('Короткое описание')

    // Dates
    expect(ex.dateRange).toBe('10 января — 15 февраля 2025')
    expect(ex.dateStart).toBe('2025-01-10')
    expect(ex.dateEnd).toBe('2025-02-15')

    // Flags & info
    expect(ex.isFree).toBe(true)
    expect(ex.ticketInfo).toBe('Вход свободный')

    // Cover
    expect(ex.coverImage).toBe('https://example.com/cover.jpg')

    // Status mapping
    expect(ex.status).toBe('ongoing')

    // Location nested object reconstructed from flat columns
    expect(ex.location).toEqual({
      venue: 'Галерея «Север»',
      city: 'Москва',
      addressLine: 'ул. Тверская, 1',
      metro: ['Тверская', 'Пушкинская'],
      mapLink: 'https://yandex.ru/maps/?text=...',
    })

    // Description split
    expect(ex.descriptionIntro).toBe('Intro текст')
    expect(ex.descriptionBody).toBe('Body текст')

    // Schedule & works parsed from JSON columns
    expect(ex.schedule).toHaveLength(2)
    expect(ex.schedule[0]).toMatchObject({ id: 'mon', label: 'Понедельник', time: '10:00–19:00' })
    expect(ex.schedule[1]).toMatchObject({ id: 'tue', isClosed: true })

    expect(ex.works).toHaveLength(1)
    expect(ex.works[0]?.title).toBe('Зимний лес')
  })

  it('возвращает draft → planned', async () => {
    const now = Date.now()
    getDb().prepare(`
      INSERT INTO exhibitions (
        id, slug, title, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run('ex_2', 'planned-one', 'План', 'draft', now, now)

    const fakeEvent = { context: {} } as unknown as Parameters<typeof exhibitionsGetHandler>[0]
    const result = await exhibitionsGetHandler(fakeEvent)
    const planned = result.find(e => e.id === 'ex_2')
    expect(planned?.status).toBe('planned')

    getDb().prepare('DELETE FROM exhibitions WHERE id = ?').run('ex_2')
  })

  it('возвращает finished для прошедшей выставки (draft + date_end в прошлом)', async () => {
    const now = Date.now()
    getDb().prepare(`
      INSERT INTO exhibitions (
        id, slug, title, status, date_end, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('ex_3', 'finished-one', 'Завершена', 'draft', '2020-01-01', now, now)

    const fakeEvent = { context: {} } as unknown as Parameters<typeof exhibitionsGetHandler>[0]
    const result = await exhibitionsGetHandler(fakeEvent)
    const finished = result.find(e => e.id === 'ex_3')
    expect(finished?.status).toBe('finished')

    getDb().prepare('DELETE FROM exhibitions WHERE id = ?').run('ex_3')
  })

  it('нормализует пустые JSON-поля в пустые массивы', async () => {
    const now = Date.now()
    getDb().prepare(`
      INSERT INTO exhibitions (
        id, slug, title, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run('ex_4', 'empty-json', 'Пусто', 'draft', now, now)

    const fakeEvent = { context: {} } as unknown as Parameters<typeof exhibitionsGetHandler>[0]
    const result = await exhibitionsGetHandler(fakeEvent)
    const empty = result.find(e => e.id === 'ex_4')
    expect(empty?.schedule).toEqual([])
    expect(empty?.works).toEqual([])
    expect(empty?.location.metro).toEqual([])

    getDb().prepare('DELETE FROM exhibitions WHERE id = ?').run('ex_4')
  })

  it('фильтрует по статусу (published)', async () => {
    const fakeEvent = { context: {}, query: { status: 'published' } } as unknown as Parameters<typeof exhibitionsGetHandler>[0]
    const published = await exhibitionsGetHandler(fakeEvent)
    expect(published.every(e => e.status === 'ongoing')).toBe(true)
    expect(published.length).toBeGreaterThanOrEqual(1)
  })
})
