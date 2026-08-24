import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { applyMigrations, insertFullOrder, setupTestDb } from '../../../__tests__/helpers/db'

const TEST_DIR = resolve(process.cwd(), 'tmp-server-tests/admin-orders-patch')

// Мокаем requireAuth, чтобы тесты не зависели от cookies/сессий.
const mockAuthUser = { id: 1, email: 'admin@test.com', name: 'Admin' }
vi.mock('../../../../utils/requireAuth', () => ({
  requireAuth: () => mockAuthUser,
}))

// Мокаем SMTP-отправку, чтобы тесты не ходили в реальный mail.ru.
const sendViaSmtpMock = vi.fn()
const getSmtpTransportConfigMock = vi.fn()
vi.mock('../../../notifications/email.post', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../notifications/email.post')>()
  return {
    ...actual,
    sendViaSmtp: (...args: unknown[]) => sendViaSmtpMock(...args),
    getSmtpTransportConfig: () => getSmtpTransportConfigMock(),
  }
})

beforeAll(() => {
  setupTestDb(TEST_DIR, 'test-admin-orders-patch.db')
})

afterAll(() => {
  rmSync(TEST_DIR, { recursive: true, force: true })
})

describe('PATCH /api/admin/orders/[id]', () => {
  let getDb: typeof import('../../../../utils/db').getDb
  let closeDb: typeof import('../../../../utils/db').closeDb
  let handler: typeof import('../../../../api/admin/orders/[id].patch').default

  beforeAll(async () => {
    const dbModule = await import('../../../../utils/db')
    getDb = dbModule.getDb
    closeDb = dbModule.closeDb

    applyMigrations(getDb())

    // admin_users уже сидируется в 006_admin_seed.sql — повторно не вставляем.

    insertFullOrder(getDb(), {
      id: 'ap_status',
      customer_name: 'Покупатель',
      customer_email: 'buyer@example.com',
      delivery_type: 'pickup',
      items_json: JSON.stringify([{ productId: '1', title: 'X', amount: 1, price: 1000 }]),
      total: 1000,
      status: 'new',
      payment_method: 'manual',
      created_at: Date.now(),
      updated_at: Date.now(),
    })

    insertFullOrder(getDb(), {
      id: 'ap_with_telegram_ok',
      customer_name: 'Покупатель2',
      customer_email: 'b2@example.com',
      delivery_type: 'pickup',
      items_json: JSON.stringify([]),
      total: 500,
      status: 'new',
      payment_method: 'manual',
      notification_failed: JSON.stringify({ telegram: true, email: true }),
      created_at: Date.now(),
      updated_at: Date.now(),
    })

    handler = (await import('../../../../api/admin/orders/[id].patch')).default
  })

  beforeEach(() => {
    sendViaSmtpMock.mockReset()
    // По умолчанию SMTP настроен, отправка успешна.
    getSmtpTransportConfigMock.mockReset()
    getSmtpTransportConfigMock.mockReturnValue({
      host: 'smtp.test',
      port: 465,
      secure: true,
      auth: { user: 'shop@test.com', pass: 'secret' },
    })
    sendViaSmtpMock.mockResolvedValue({ ok: true })

    // Сбрасываем status='new' перед каждым тестом. notification_failed сбрасываем
    // только у ap_status (он используется в большинстве тестов как чистый),
    // а у ap_with_telegram_ok оставляем {telegram:true,email:true} для merge-теста.
    getDb()
      .prepare("UPDATE orders SET status = 'new', notification_failed = NULL WHERE id = 'ap_status'")
      .run()
    getDb()
      .prepare("UPDATE orders SET status = 'new' WHERE id = 'ap_with_telegram_ok'")
      .run()
  })

  afterAll(() => {
    closeDb()
  })

  function callHandler(id: string, body: Record<string, unknown>) {
    return handler({
      context: {},
      params: { id },
      body,
    } as never) as Promise<{ ok: boolean, status: string, email: { ok: boolean, error?: string } | null, noChange?: boolean }>
  }

  it('обновляет статус в БД + отправляет email (default sendEmail=true)', async () => {
    const result = await callHandler('ap_status', { status: 'paid', message: 'Спасибо!' })

    expect(result.ok).toBe(true)
    expect(result.status).toBe('paid')
    expect(result.email?.ok).toBe(true)

    // БД: status обновился
    const row = getDb()
      .prepare('SELECT status FROM orders WHERE id = ?')
      .get('ap_status') as { status: string }
    expect(row.status).toBe('paid')

    // Email был отправлен с правильным to/subject/html
    expect(sendViaSmtpMock).toHaveBeenCalledTimes(1)
    const call = sendViaSmtpMock.mock.calls[0]?.[0] as { to: string, subject: string, html: string }
    expect(call.to).toBe('buyer@example.com')
    expect(call.subject).toBe('Обновление статуса заказа #ap_status')
    expect(call.html).toContain('Покупатель')
    expect(call.html).toContain('Оплачен')
    expect(call.html).toContain('Спасибо!')

    // notification_failed в БД: только email (telegram=true сохранён)
    const notif = getDb()
      .prepare('SELECT notification_failed FROM orders WHERE id = ?')
      .get('ap_status') as { notification_failed: string }
    const parsed = JSON.parse(notif.notification_failed)
    expect(parsed).toEqual({ email: true })
  })

  it('merge с существующим notification_failed: telegram не затирается', async () => {
    // ap_with_telegram_ok имеет notification_failed = {telegram: true, email: true}
    const result = await callHandler('ap_with_telegram_ok', { status: 'shipped' })

    expect(result.ok).toBe(true)
    expect(sendViaSmtpMock).toHaveBeenCalledTimes(1)

    const notif = getDb()
      .prepare('SELECT notification_failed FROM orders WHERE id = ?')
      .get('ap_with_telegram_ok') as { notification_failed: string }
    const parsed = JSON.parse(notif.notification_failed)
    // telegram остался true, email перезаписался
    expect(parsed).toEqual({ telegram: true, email: true })
  })

  it('sendEmail=false → status обновляется, email НЕ отправляется, БД не трогается', async () => {
    const result = await callHandler('ap_status', { status: 'paid', sendEmail: false })

    expect(result.ok).toBe(true)
    expect(result.email).toBeNull() // null = email не отправлялся
    expect(sendViaSmtpMock).not.toHaveBeenCalled()

    const row = getDb()
      .prepare('SELECT status, notification_failed FROM orders WHERE id = ?')
      .get('ap_status') as { status: string, notification_failed: string | null }
    expect(row.status).toBe('paid')
    expect(row.notification_failed).toBeNull() // не записан
  })

  it('SMTP падает → result.email.ok=false, notification_failed.email=false', async () => {
    sendViaSmtpMock.mockResolvedValueOnce({ ok: false, error: 'SMTP down' })

    const result = await callHandler('ap_status', { status: 'cancelled' })

    expect(result.ok).toBe(true) // PATCH сам по себе успешен
    expect(result.email?.ok).toBe(false)
    expect(result.email?.error).toBe('SMTP down')

    const notif = getDb()
      .prepare('SELECT notification_failed FROM orders WHERE id = ?')
      .get('ap_status') as { notification_failed: string }
    expect(JSON.parse(notif.notification_failed)).toEqual({ email: false })
  })

  it('SMTP не настроен → result.email.error="SMTP not configured", notification_failed.email=false', async () => {
    getSmtpTransportConfigMock.mockReturnValueOnce(null)

    const result = await callHandler('ap_status', { status: 'paid' })

    expect(result.email?.ok).toBe(false)
    expect(result.email?.error).toBe('SMTP not configured')

    const notif = getDb()
      .prepare('SELECT notification_failed FROM orders WHERE id = ?')
      .get('ap_status') as { notification_failed: string }
    expect(JSON.parse(notif.notification_failed)).toEqual({ email: false })
  })

  it('400 для невалидного status', async () => {
    await expect(callHandler('ap_status', { status: 'invalid' })).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it('400 без status', async () => {
    await expect(callHandler('ap_status', {})).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it('404 для несуществующего заказа', async () => {
    await expect(callHandler('missing_order', { status: 'paid' })).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('B2: same-status PATCH → 200 + noChange (НЕ 404)', async () => {
    // B2: раньше same-status PATCH возвращал 404 «Заказ не найден», потому что
    // SQLite UPDATE возвращает changes=0 и при «строка есть, но status уже = новому».
    // Теперь SELECT сначала различает эти случаи.
    getDb().prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run('ap_status')

    const result = await callHandler('ap_status', { status: 'paid', message: 'Test' })

    expect(result.ok).toBe(true)
    expect(result.status).toBe('paid')
    expect(result.noChange).toBe(true)
    expect(result.email).toBeNull() // email не отправляется при noChange
    expect(sendViaSmtpMock).not.toHaveBeenCalled()

    // notification_failed не пишется
    const notif = getDb()
      .prepare('SELECT notification_failed FROM orders WHERE id = ?')
      .get('ap_status') as { notification_failed: string | null }
    expect(notif.notification_failed).toBeNull()
  })

  it('email с customMessage — попадает в HTML', async () => {
    await callHandler('ap_status', { status: 'paid', message: 'КУРЬЕР СЛОМАЛСЯ\nЕдем завтра' })

    const call = sendViaSmtpMock.mock.calls[0]?.[0] as { html: string }
    expect(call.html).toContain('КУРЬЕР СЛОМАЛСЯ')
    expect(call.html).toContain('Едем завтра')
    // white-space: pre-wrap сохраняет перенос
    expect(call.html).toContain('white-space: pre-wrap')
  })

  it('email с XSS в customMessage — экранируется', async () => {
    await callHandler('ap_status', {
      status: 'paid',
      message: '<script>alert(1)</script>',
    })

    const call = sendViaSmtpMock.mock.calls[0]?.[0] as { html: string }
    expect(call.html).not.toContain('<script>alert(1)</script>')
    expect(call.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('email с пустым customer.email → error, не throw', async () => {
    getDb()
      .prepare("UPDATE orders SET customer_email = '' WHERE id = ?")
      .run('ap_status')

    const result = await callHandler('ap_status', { status: 'paid' })
    expect(result.email?.ok).toBe(false)
    expect(result.email?.error).toBe('Customer email is empty')
    // status всё равно обновился
    const row = getDb()
      .prepare('SELECT status FROM orders WHERE id = ?')
      .get('ap_status') as { status: string }
    expect(row.status).toBe('paid')
  })
})