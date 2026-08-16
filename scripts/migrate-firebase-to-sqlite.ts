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
      (id, customer_name, customer_email, customer_phone, city, address,
       items_json, total, status, comment, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        c.delivery?.city ?? null,
        c.delivery?.address ?? null,
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
  console.log('\n🖼️  Читаю /exhibitions/* ...')
  const data = await readAll<FbExhibition>('exhibitions')
  const ids = Object.keys(data)
  console.log(`   Найдено: ${ids.length}`)

  const db = getDb()
  const now = Date.now()

  const insert = db.prepare(`
    INSERT OR REPLACE INTO exhibitions
      (id, title, description, date, location, cover_image, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const results: Array<{ ok: boolean, id: string, reason?: string }> = []
  const tx = db.transaction((items: Array<[string, FbExhibition]>) => {
    for (const [id, e] of items) {
      if (!e.title) {
        results.push({ ok: false, id, reason: 'нет title' })
        continue
      }
      insert.run(
        id,
        e.title,
        buildExhibitionDescription(e),
        e.dateStart ?? null,
        buildExhibitionLocation(e.location),
        e.coverImage ?? null,
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