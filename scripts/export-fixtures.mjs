#!/usr/bin/env node
/**
 * Скачивает фикстуры для Vercel preview из prod API.
 *
 * Запускать вручную когда нужно обновить тестовые данные:
 *   node scripts/export-fixtures.mjs
 *
 * Что делает:
 *   - GET /api/products → server/fixtures/products.json (первые 20)
 *   - GET /api/categories → server/fixtures/categories.json
 *   - GET /api/exhibitions → server/fixtures/exhibitions.json
 *
 * Безопасность: это публичные данные (каталог), PII не выгружается.
 */

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const PROD = process.env.PROD_URL || 'https://kalashyulya.ru'
const OUT_DIR = join(process.cwd(), 'server/fixtures')

async function fetchJson(path) {
  const res = await fetch(`${PROD}${path}`)
  if (!res.ok) throw new Error(`Failed ${path}: ${res.status}`)
  return res.json()
}

async function main() {
  console.log(`Exporting fixtures from ${PROD}...`)
  const [products, categories, exhibitions] = await Promise.all([
    fetchJson('/api/products'),
    fetchJson('/api/categories'),
    fetchJson('/api/exhibitions'),
  ])

  // Только первые 20 товаров — UI preview достаточно.
  // Не выгружаем ВСЕ 199 чтобы не раздувать репо.
  const productsSampled = products.slice(0, 20)

  writeFileSync(join(OUT_DIR, 'products.json'), JSON.stringify({ products: productsSampled }, null, 2))
  writeFileSync(join(OUT_DIR, 'categories.json'), JSON.stringify({ categories }, null, 2))
  writeFileSync(join(OUT_DIR, 'exhibitions.json'), JSON.stringify({ exhibitions }, null, 2))

  console.log('✓ Exported:')
  console.log(`  products:   ${productsSampled.length} (of ${products.length})`)
  console.log(`  categories: ${categories.length}`)
  console.log(`  exhibitions: ${exhibitions.length}`)
}

main().catch(err => {
  console.error('Export failed:', err)
  process.exit(1)
})