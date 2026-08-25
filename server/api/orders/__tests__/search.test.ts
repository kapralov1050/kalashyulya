import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  applyMigrations,
  insertFullOrder,
  setupTestDb,
} from '../../__tests__/helpers/db'

const TEST_DIR = resolve(process.cwd(), 'tmp-server-tests/orders-search')

beforeAll(() => {
  setupTestDb(TEST_DIR, 'test-orders-search.db')
})

afterAll(() => {
  rmSync(TEST_DIR, { recursive: true, force: true })
})

describe('GET /api/orders/search', () => {
  let getDb: typeof import('../../../utils/db').getDb
  let closeDb: typeof import('../../../utils/db').closeDb
  let handler: typeof import('../../../api/orders/search.get').default

  beforeAll(async () => {
    const dbModule = await import('../../../utils/db')
    getDb = dbModule.getDb
    closeDb = dbModule.closeDb

    applyMigrations(getDb())

    insertFullOrder(getDb(), {
      id: '20260825-04bb9555',
      customer_name: 'Сергей Петров',
      customer_email: 'sergey@example.ru',
      customer_phone: '+7 999 123-45-67',
      delivery_type: 'pickup',
      items_json: JSON.stringify([
        { id: 1, title: 'Акварель "Мост"', amount: 1, price: 5000 },
      ]),
      total: 5000,
      status: 'new',
      payment_method: 'manual',
      payment_id: null,
      created_at: Date.now(),
      updated_at: Date.now(),
    })

    insertFullOrder(getDb(), {
      id: '20260820-aaa11111',
      customer_name: 'Мария',
      customer_email: 'maria@example.com',
      delivery_type: 'pickup',
      items_json: JSON.stringify([
        { id: 1, title: 'Акварель "Берег"', amount: 1, price: 7500 },
      ]),
      total: 7500,
      status: 'new',
      payment_method: 'yookassa',
      payment_id: '2a3b4c5d-6e7f-8901',
      created_at: Date.now(),
      updated_at: Date.now(),
    })

    insertFullOrder(getDb(), {
      id: '314c92fb-000f-5000-b000-1c4140d12338',
      customer_name: 'Анна Сидорова',
      customer_email: 'anna@example.ru',
      customer_phone: '+7 999 555-12-34',
      delivery_type: 'pickup',
      items_json: JSON.stringify([
        { id: 1, title: 'Акварель "Закат"', amount: 1, price: 4500 },
      ]),
      total: 4500,
      status: 'new',
      payment_method: 'manual',
      payment_id: null,
      created_at: Date.now(),
      updated_at: Date.now(),
    })

    handler = (await import('../../../api/orders/search.get')).default
  })

  afterAll(() => {
    closeDb()
  })

  function makeEvent(query: Record<string, string>) {
    return {
      context: {},
      query,
    } as never
  }

  it('400 если number отсутствует', async () => {
    // Handler synchronous — оборачиваем в async, чтобы throw стал rejected promise.
    await expect((async () => handler(makeEvent({})))()).rejects.toHaveProperty(
      'statusCode',
      400,
    )
  })

  it('400 если number — пустая строка', async () => {
    await expect(
      (async () => handler(makeEvent({ number: '' })))(),
    ).rejects.toHaveProperty('statusCode', 400)
  })

  it('400 если number — только пробелы и `#`', async () => {
    await expect(
      (async () => handler(makeEvent({ number: '   ##  ' })))(),
    ).rejects.toHaveProperty('statusCode', 400)
  })

  it('находит заказ по id без `#`', async () => {
    const result = await handler(makeEvent({ number: '20260825-04bb9555' }))
    expect(result).not.toBeNull()
    expect(result?.id).toBe('20260825-04bb9555')
    expect(result?.customer.name).toBe('Сергей Петров')
    expect(result?.paymentMethod).toBe('manual')
  })

  it('находит заказ по id с ведущим `#` (URL-encoded)', async () => {
    const result = await handler(makeEvent({ number: '#20260825-04bb9555' }))
    expect(result?.id).toBe('20260825-04bb9555')
  })

  it('находит заказ по payment_id (YooKassa)', async () => {
    const result = await handler(makeEvent({ number: '2a3b4c5d-6e7f-8901' }))
    expect(result).not.toBeNull()
    expect(result?.id).toBe('20260820-aaa11111')
    expect(result?.paymentId).toBe('2a3b4c5d-6e7f-8901')
    expect(result?.paymentMethod).toBe('yookassa')
  })

  it('поиск регистронезависим (uppercase → lowercase в БД)', async () => {
    // В БД id хранится в lowercase; пользователь может ввести любой регистр.
    const result = await handler(makeEvent({ number: '20260825-04BB9555' }))
    expect(result?.id).toBe('20260825-04bb9555')
  })

  it('поиск устойчив к пробелам вокруг ввода', async () => {
    const result = await handler(
      makeEvent({ number: '   20260825-04bb9555   ' }),
    )
    expect(result?.id).toBe('20260825-04bb9555')
  })

  it('возвращает null если ничего не найдено', async () => {
    const result = await handler(makeEvent({ number: 'nonexistent-order' }))
    expect(result).toBeNull()
  })

  it('находит заказ по UUID-style id (формат production)', async () => {
    // В реальной БД id имеет UUID-формат, не YYYYMMDD-XXXXXXXX.
    // Плейсхолдер показывает пример именно такого формата.
    const result = await handler(
      makeEvent({ number: '314c92fb-000f-5000-b000-1c4140d12338' }),
    )
    expect(result).not.toBeNull()
    expect(result?.id).toBe('314c92fb-000f-5000-b000-1c4140d12338')
    expect(result?.customer.name).toBe('Анна Сидорова')
  })

  it('находит заказ по UUID с ведущим `#`', async () => {
    const result = await handler(
      makeEvent({ number: '#314c92fb-000f-5000-b000-1c4140d12338' }),
    )
    expect(result?.id).toBe('314c92fb-000f-5000-b000-1c4140d12338')
  })

  it('возвращает полный OrderInBase (id, customer, purchase, totalPrice)', async () => {
    const result = await handler(makeEvent({ number: '20260825-04bb9555' }))
    expect(result).toMatchObject({
      id: '20260825-04bb9555',
      status: 'new',
      statusLabel: 'Новый заказ',
      totalPrice: 5000,
      paymentMethod: 'manual',
      paymentId: '',
      customer: {
        name: 'Сергей Петров',
        email: 'sergey@example.ru',
        phone: '+7 999 123-45-67',
        delivery: expect.objectContaining({ type: 'pickup' }),
      },
      purchase: expect.objectContaining({
        order: [{ id: 1, title: 'Акварель "Мост"', amount: 1, price: 5000 }],
      }),
    })
  })
})
