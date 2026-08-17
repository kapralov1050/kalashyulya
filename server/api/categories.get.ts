/**
 * GET /api/categories — список категорий каталога (из Firebase /shop/categories).
 *
 * Категории закэшированы SQLite. Возвращаются отсортированными по полю `order`.
 */

export interface CategoryDto {
  id: string
  name: string
  order: number
}

export default defineEventHandler((): CategoryDto[] => {
  const rows = getDb()
    .prepare('SELECT id, name, "order" FROM categories ORDER BY "order" ASC')
    .all() as CategoryDto[]
  return rows
})