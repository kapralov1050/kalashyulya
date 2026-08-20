import { getDb } from '../../../utils/db'

/**
 * POST /api/products/:id/view — инкрементировать счётчик просмотров.
 * Публичный endpoint (без auth) — вызывается анонимным посетителем.
 *
 * SQLite UPDATE атомарен на уровне строки, так что race conditions между
 * несколькими одновременными посетителями не страшны.
 *
 * Использует `views = views + 1` вместо read-modify-write чтобы избежать
 * lost-update.
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id обязателен' })
  }

  const info = getDb()
    .prepare('UPDATE products SET views = views + 1, updated_at = ? WHERE id = ?')
    .run(Date.now(), id)

  if (info.changes === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Товар не найден' })
  }

  return { ok: true }
})