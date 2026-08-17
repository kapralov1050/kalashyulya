/**
 * Миграция данных из Firebase Realtime Database в SQLite.
 *
 * Использование:
 *   GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json \
 *     FIREBASE_DATABASE_URL=https://<project>.firebaseio.com \
 *     SQLITE_PATH=./data/data.db \
 *     npx tsx scripts/migrate-firebase-to-sqlite.ts
 *
 * Флаги:
 *   --dry-run   не писать в БД, только показать что будет мигрировано
 *
 * Что делает:
 *   - читает /shop/products/* → таблица products (все поля: stock, tags, framing,
 *     size, material, tecnic, certificate_id, views, is_reserved, files, category_id)
 *   - читает /orders/*       → таблица orders (productId резолвится из products
 *     по title если в item.id не было)
 *   - читает /exhibitions/*  → таблица exhibitions
 *   - читает /users/*        → список email'ов для последующего reset пароля
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'
import { closeDb, getDb } from '../server/utils/db'
import {
  buildExhibitionDescription,
  buildExhibitionLocation,
  mapExhibitionStatus,
  mapOrderItems,
  mapOrderStatus,
  mapProductStatus,
  resolveOrderItemProductId,
} from './migration-mappers'

const DRY_RUN = process.argv.includes('--dry-run')
const CREDS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS
const DB_URL = process.env.FIREBASE_DATABASE_URL

if (!CREDS_PATH || !existsSync(CREDS_PATH)) {
  console.error('❌ GOOGLE_APPLICATION_CREDENTIALS не указан или файл не найден.')
  process.exit(1)
}
if (!DB_URL) {
  console.error('❌ FIREBASE_DATABASE_URL не указан.')
  process.exit(1)
}

const app = getApps()[0] ?? initializeApp({
  credential: cert(resolve(CREDS_PATH)),
  databaseURL: DB_URL,
})
const fbDb = getDatabase(app)

interface FbProduct {
  title?: string
  description?: string
  size?: string
  material?: string
  tecnic?: string
  year?: string | number
  image?: string[]
  file?: string[]
  price?: number
  stock?: number
  tags?: string[]
  framing?: ('frame' | 'passepartout')[]
  certificateId?: string
  categoryId?: string
  isReserved?: boolean
  views?: number
}

interface FbOrder {
  customer?: {
    name?: string
    email?: string
    phone?: string
    userMessenger?: string
    userNickname?: string
    delivery?: {
      type?: 'pickup' | 'delivery'
      city?: string
      recipient?: string
      address?: string
      street?: string
      house?: string
      apartment?: string
    }
  }
  purchase?: {
    order?: Array<{ id?: string | number, title?: string, price?: number, amount?: number, quantity?: number }>
    createdAt?: string
  }
  totalPrice?: number
  framing?: string
  paymentMethod?: string
  status?: string
  paymentId?: string
  notificationFailed?: { telegram?: boolean, email?: boolean }
}

interface FbExhibition {
  id?: number
  slug?: string
  title?: string
  status?: string
  descriptionIntro?: string
  descriptionBody?: string
  dateStart?: string
  dateEnd?: string
  dateRange?: string
  coverImage?: string
  location?: { venue?: string, city?: string, address?: string, addressLine?: string, metro?: string[], mapLink?: string }
  isFree?: boolean
  ticketInfo?: string
  schedule?: unknown[]
  shortDescription?: string
  works?: unknown[]
}

async function readAll<T>(path: string): Promise<Record<string, T>> {
  const snap = await fbDb.ref(path).once('value')
  return snap.exists() ? (snap.val() as Record<string, T>) : {}
}

function fmtReport(title: string, rows: Array<{ ok: boolean, id: string, reason?: string }>) {
  const ok = rows.filter(r => r.ok).length
  const fail = rows.length - ok
  console.log(`\n${title}: ${ok} ok, ${fail} failed (из ${rows.length})`)
  for (const r of rows.filter(r => !r.ok)) {
    console.log(`  ❌ ${r.id}: ${r.reason}`)
  }
}

async function migrateProducts() {
  console.log('\n📦 Читаю /shop/products/* ...')
  const data = await readAll<FbProduct>('shop/products')
  const ids = Object.keys(data)
  console.log(`   Найдено: ${ids.length}`)

  const db = getDb()
  const now = Date.now()

  const insert = db.prepare(`
    INSERT OR REPLACE INTO products
      (id, title, description, size, material, tecnic, year, price, stock, views,
       certificate_id, is_reserved, status, category_id, images, files, tags, framing,
       created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const results: Array<{ ok: boolean, id: string, reason?: string }> = []
  const tx = db.transaction((items: Array<[string, FbProduct]>) => {
    for (const [id, p] of items) {
      if (!p.title || typeof p.price !== 'number') {
        results.push({ ok: false, id, reason: 'нет title или price' })
        continue
      }
      insert.run(
        id,
        p.title,
        p.description ?? null,
        p.size ?? null,
        p.material ?? null,
        p.tecnic ?? null,
        p.year ? Number(p.year) : null,
        p.price,
        p.stock ?? 0,
        p.views ?? 0,
        p.certificateId ?? null,
        p.isReserved ? 1 : 0,
        mapProductStatus({ isReserved: p.isReserved, stock: p.stock }),
        p.categoryId ?? null,
        JSON.stringify(p.image ?? []),
        JSON.stringify(p.file ?? []),
        JSON.stringify(p.tags ?? []),
        JSON.stringify(p.framing ?? []),
        now,
        now,
      )
      results.push({ ok: true, id })
    }
  })
  tx(Object.entries(data))

  fmtReport('products', results)
}

async function migrateOrders() {
  console.log('\n🛒 Читаю /orders/* ...')
  const data = await readAll<FbOrder>('orders')
  const ids = Object.keys(data)
  console.log(`   Найдено: ${ids.length}`)

  // Билдим titleMap из уже загруженных products, чтобы резолвить productId
  const productsData = await readAll<{ title?: string }>('shop/products')
  const titleMap = new Map<string, string>()
  for (const [id, p] of Object.entries(productsData)) {
    if (p.title) titleMap.set(p.title.trim(), id)
  }
  console.log(`   TitleMap: ${titleMap.size} товаров`)

  const db = getDb()
  const now = Date.now()

  const insert = db.prepare(`
    INSERT OR REPLACE INTO orders
      (id, customer_name, customer_email, customer_phone,
       customer_messenger, customer_nickname,
       city, address,
       delivery_type, delivery_recipient, delivery_street, delivery_house, delivery_apartment,
       items_json, total, status, comment, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const results: Array<{ ok: boolean, id: string, reason?: string }> = []
  const tx = db.transaction((items: Array<[string, FbOrder]>) => {
    for (const [id, o] of items) {
      const c = o.customer
      if (!c?.name || !c?.email) {
        results.push({ ok: false, id, reason: 'нет customer.name или email' })
        continue
      }
      const itemsJson = JSON.stringify(
        (o.purchase?.order ?? []).map(i => {
          const productId = resolveOrderItemProductId(i, titleMap)
          const mapped = mapOrderItems([i])[0]
          return { ...mapped, productId }
        }),
      )
      const total = o.totalPrice ?? 0
      insert.run(
        id,
        c.name,
        c.email,
        c.phone ?? null,
        c.userMessenger ?? null,
        c.userNickname ?? null,
        c.delivery?.city ?? null,
        c.delivery?.address ?? null,
        c.delivery?.type ?? null,
        c.delivery?.recipient ?? null,
        c.delivery?.street ?? null,
        c.delivery?.house ?? null,
        c.delivery?.apartment ?? null,
        itemsJson,
        total,
        mapOrderStatus(o.status),
        null,
        now,
        now,
      )
      results.push({ ok: true, id })
    }
  })
  tx(Object.entries(data))

  fmtReport('orders', results)
}

async function migrateExhibitions() {
  console.log('\n�️  Читаю /exhibitions/* ...')
  const data = await readAll<FbExhibition>('exhibitions')
  const ids = Object.keys(data)
  console.log(`   Найдено: ${ids.length}`)

  const db = getDb()
  const now = Date.now()

  const insert = db.prepare(`
    INSERT OR REPLACE INTO exhibitions
      (id, slug, title, tab_title, short_description,
       description_intro, description_body, description,
       date_start, date_end, date, date_range,
       location_venue, location_city, location_address, location_address_line,
       location_metro_json, location_map_link, location,
       cover_image, is_free, ticket_info, schedule_json, works_json,
       status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const results: Array<{ ok: boolean, id: string, reason?: string }> = []
  const tx = db.transaction((items: Array<[string, FbExhibition]>) => {
    for (const [id, e] of items) {
      if (!e.title) {
        results.push({ ok: false, id, reason: 'нет title' })
        continue
      }
      const loc = e.location ?? {}
      insert.run(
        id,
        e.slug ?? null,
        e.title,
        // tab_title в Firebase не было — берём из title, можно переопределить в админке
        null,
        e.shortDescription ?? null,
        e.descriptionIntro ?? null,
        e.descriptionBody ?? null,
        buildExhibitionDescription(e),
        e.dateStart ?? null,
        e.dateEnd ?? null,
        e.dateStart ?? null,
        e.dateRange ?? null,
        loc.venue ?? null,
        loc.city ?? null,
        loc.address ?? null,
        loc.addressLine ?? null,
        JSON.stringify(loc.metro ?? []),
        loc.mapLink ?? null,
        buildExhibitionLocation(e.location),
        e.coverImage ?? null,
        e.isFree ? 1 : 0,
        e.ticketInfo ?? null,
        JSON.stringify(e.schedule ?? []),
        JSON.stringify(e.works ?? []),
        mapExhibitionStatus(e.status),
        now,
        now,
      )
      results.push({ ok: true, id })
    }
  })
  tx(Object.entries(data))

  fmtReport('exhibitions', results)
}

interface FbCategory {
  name: string
  order: number
}

async function migrateCategories() {
  console.log('\n📂 Читаю /shop/categories ...')
  // /shop/categories — это массив (не map), id = индекс в массиве.
  const snap = await fbDb.ref('shop/categories').once('value')
  if (!snap.exists()) {
    console.log('   Не найдено.')
    return
  }
  const arr = snap.val() as Array<FbCategory | null>
  const db = getDb()
  const now = Date.now()

  const insert = db.prepare(`
    INSERT OR REPLACE INTO categories (id, name, "order")
    VALUES (?, ?, ?)
  `)
  const touch = db.prepare('UPDATE products SET updated_at = ?, category_id = ? WHERE id = ?')
  const lookup = db.prepare('SELECT id FROM products WHERE category_id = ? LIMIT 1')

  const results: Array<{ ok: boolean, id: string, reason?: string }> = []
  const tx = db.transaction(() => {
    // Сначала затираем старые связи product.category_id (если категории переименовались)
    db.prepare("UPDATE products SET category_id = NULL WHERE category_id LIKE 'category_%'").run()
    db.prepare('DELETE FROM categories').run()

    arr.forEach((cat, index) => {
      if (!cat || !cat.name) return // пропускаем null (дырки в Firebase массиве)
      const id = `category_${cat.order}`
      insert.run(id, cat.name, cat.order)
      results.push({ ok: true, id: `category_${cat.order} (idx=${index})` })
    })
  })
  tx()

  fmtReport('categories', results)

  // Теперь обновляем category_id у товаров: в Firebase product.categoryId
  // хранился как порядковый номер (1, 2, 3...), в SQLite используем префикс.
  console.log('\n   Проставляю category_id у товаров...')
  const productsData = await readAll<{ categoryId?: string | number }>('shop/products')
  let updatedCount = 0
  const txProducts = db.transaction(() => {
    for (const [id, p] of Object.entries(productsData)) {
      if (p.categoryId !== undefined && p.categoryId !== null) {
        const catId = `category_${p.categoryId}`
        // проверим что такая категория есть
        const exists = db.prepare('SELECT 1 FROM categories WHERE id = ?').get(catId)
        if (exists) {
          touch.run(now, catId, id)
          updatedCount++
        }
      }
    }
  })
  txProducts()
  console.log(`   Обновлено ${updatedCount} товаров с category_id`)
}

interface FbCertificateCounter {
  // /certificates/{YYYY} — это просто число (число выданных в этом году)
  [year: string]: number
}

async function migrateCertificates() {
  console.log('\n📜 Читаю /certificates/{YYYY} ...')
  const data = await readAll<number>('certificates')
  const years = Object.keys(data)
  console.log(`   Найдено: ${years.length} записей`)

  const db = getDb()

  const insert = db.prepare(`
    INSERT OR REPLACE INTO certificates_counter (year, count)
    VALUES (?, ?)
  `)

  const results: Array<{ ok: boolean, id: string, reason?: string }> = []
  const tx = db.transaction((entries: Array<[string, number]>) => {
    for (const [year, count] of entries) {
      const y = Number(year)
      if (!Number.isInteger(y) || y < 2000 || y > 3000) {
        results.push({ ok: false, id: year, reason: 'некорректный год' })
        continue
      }
      insert.run(y, count)
      results.push({ ok: true, id: `${y}: ${count}` })
    }
  })
  tx(Object.entries(data))

  fmtReport('certificates_counter', results)
}

async function listAdminEmails() {
  console.log('\n👤 Читаю /users/* (только для справки, пароли мигрировать нельзя) ...')
  const data = await readAll<{ email?: string }>('users')
  const emails = Object.entries(data)
    .map(([uid, u]) => ({ uid, email: u.email }))
    .filter(u => u.email)

  console.log(`   Найдено ${emails.length} пользователей:`)
  for (const u of emails) console.log(`     - ${u.email} (uid=${u.uid})`)

  if (emails.length > 0) {
    console.log('\n   ⚠️  Чтобы дать им доступ к новой админке:')
    console.log('      ADMIN_EMAIL=<email> ADMIN_PASSWORD=<pwd> npx tsx server/scripts/seed-admin.ts')
  }
}

async function main() {
  if (DRY_RUN) {
    console.log('🧪 DRY RUN: данные в БД не записываются\n')
  }

  await migrateProducts()
  await migrateOrders()
  await migrateExhibitions()
  await migrateCategories()
  await migrateCertificates()
  await listAdminEmails()

  closeDb()

  console.log('\n✅ Миграция завершена.')
  if (!DRY_RUN) {
    console.log('   Проверь: node -e "const db = require(\'better-sqlite3\')(\'./data/data.db\'); console.log(db.prepare(\'SELECT COUNT(*) as n FROM products\').get())"')
  }

  process.exit(0)
}

main().catch(err => {
  console.error('\n❌ Ошибка миграции:', err)
  closeDb()
  process.exit(1)
})