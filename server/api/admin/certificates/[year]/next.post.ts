import { getDb } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/requireAuth'

export default defineEventHandler(
  (event): { count: number, id: string } => {
    requireAuth(event)
    const year = Number(getRouterParam(event, 'year'))
    if (!Number.isInteger(year) || year < 2000 || year > 3000) {
      throw createError({ statusCode: 400, message: 'Некорректный год' })
    }

    const db = getDb()

    // Источник правды — отдельная таблица-счётчик (мигрирована из Firebase /certificates/{YYYY}).
    // Если за год ещё нет записи (первый сертификат за этот год),
    // инициализируем счётчик через COUNT существующих products с certificate_id этого года.
    const initStmt = db.prepare(
      `INSERT INTO certificates_counter (year, count)
       SELECT ?, COUNT(*) FROM products WHERE certificate_id LIKE ?
       ON CONFLICT(year) DO NOTHING`,
    )
    initStmt.run(year, `JK-${year}-%`)

    const upd = db.prepare(
      'UPDATE certificates_counter SET count = count + 1 WHERE year = ? RETURNING count',
    )
    const row = upd.get(year) as { count: number } | undefined
    const next = row?.count ?? 1
    const id = `JK-${year}-${String(next).padStart(3, '0')}`
    return { count: next, id }
  },
)