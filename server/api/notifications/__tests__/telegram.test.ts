import { describe, expect, it } from 'vitest'
import { buildTelegramMessage } from '../../../utils/telegramMessage'
import type { Order } from '../../../../app/types'

const baseOrder: Order = {
  customer: {
    name: 'Иван Петров',
    phone: '+79991234567',
    email: 'ivan@test.com',
    userMessenger: 'Telegram',
    userNickname: '@ivan',
    delivery: {
      type: 'delivery',
      city: 'Москва',
      address: 'ул. Тверская, 1',
      recipient: 'Иван Иванов',
    },
  },
  purchase: {
    order: [
      { id: 1, title: 'Акварель "Зима"', amount: 2, price: 5000 },
      { id: 2, title: 'Открытка', amount: 1, price: 200 },
    ],
    createdAt: '2026-08-18T10:00:00.000Z',
  },
  totalPrice: 10200,
  // Доп. поля для parity-test с Yandex-форматом сообщения
  // (Order их сейчас не хранит, но форматирование полагается на них).
} as Order & { framing?: string, paymentMethod?: string }

describe('buildTelegramMessage (back-compat с Yandex-функцией)', () => {
  it('содержит заголовок «НОВЫЙ ЗАКАЗ» (как Yandex) и итоговую сумму', () => {
    const msg = buildTelegramMessage('order_42', baseOrder, 10200)
    expect(msg).toContain('НОВЫЙ ЗАКАЗ')
    expect(msg).toContain('10200 ₽')
  })

  it('содержит имя, email и телефон покупателя', () => {
    const msg = buildTelegramMessage('o1', baseOrder, 10200)
    expect(msg).toContain('Иван Петров')
    expect(msg).toContain('+79991234567')
    // Точка в email НЕ экранируется (HTML mode, не MarkdownV2)
    expect(msg).toContain('ivan@test.com')
  })

  it('содержит messenger с @nickname в формате «Связь: X · @nick»', () => {
    const msg = buildTelegramMessage('o1', baseOrder, 10200)
    expect(msg).toContain('💬')
    expect(msg).toContain('Telegram')
    expect(msg).toMatch(/Связь:[^\n]*Telegram[^\n]*@ivan/)
  })

  it('для delivery показывает город, recipient, адрес', () => {
    const msg = buildTelegramMessage('o1', baseOrder, 10200)
    expect(msg).toContain('🚚')
    expect(msg).toContain('Город: Москва')
    expect(msg).toContain('Получатель: Иван Иванов')
    expect(msg).toContain('Адрес: ул. Тверская, 1')
  })

  it('для pickup пишет «Самовывоз (Санкт-Петербург)»', () => {
    const pickupOrder: Order = {
      ...baseOrder,
      customer: { ...baseOrder.customer, delivery: { type: 'pickup' } },
    }
    const msg = buildTelegramMessage('o1', pickupOrder, 100)
    expect(msg).toContain('Самовывоз (Санкт-Петербург)')
  })

  it('для framing=simple пишет «Рама с паспарту»', () => {
    const framed = { ...baseOrder, framing: 'simple' } as Order & { framing: string }
    const msg = buildTelegramMessage('o1', framed, 100)
    // HTML-вёрстка разделяет emoji и текст — проверим по фрагментам
    expect(msg).toContain('🖼')
    expect(msg).toContain('Оформление')
    expect(msg).toContain('Рама с паспарту')
  })

  it('для premium — «Багет с паспарту»', () => {
    const framed = { ...baseOrder, framing: 'premium' } as Order & { framing: string }
    const msg = buildTelegramMessage('o1', framed, 100)
    expect(msg).toContain('Багет с паспарту')
  })

  it('для none — «Без рамки»', () => {
    const framed = { ...baseOrder, framing: 'none' } as Order & { framing: string }
    const msg = buildTelegramMessage('o1', framed, 100)
    expect(msg).toContain('Без рамки')
  })

  it('для paymentMethod=yookassa пишет «Онлайн (ЮKassa)»', () => {
    const paid = { ...baseOrder, paymentMethod: 'yookassa' } as Order & { paymentMethod: string }
    const msg = buildTelegramMessage('o1', paid, 100)
    expect(msg).toContain('💳')
    expect(msg).toContain('Оплата')
    expect(msg).toContain('Онлайн (ЮKassa)')
  })

  it('для paymentMethod=manual пишет «Перевод вручную»', () => {
    const paid = { ...baseOrder, paymentMethod: 'manual' } as Order & { paymentMethod: string }
    const msg = buildTelegramMessage('o1', paid, 100)
    expect(msg).toContain('Перевод вручную')
  })

  it('содержит все позиции заказа с ценами в формате «title × N шт. — P ₽»', () => {
    const msg = buildTelegramMessage('o1', baseOrder, 10200)
    expect(msg).toContain('Акварель')
    expect(msg).toContain('2 шт.')
    expect(msg).toContain('5000 ₽')
    expect(msg).toContain('Открытка')
    expect(msg).toContain('1 шт.')
    expect(msg).toContain('200 ₽')
    // Формат строки: «title × amount шт. — price ₽»
    expect(msg).toMatch(/Акварель[^—]*×[^—]*2 шт\.[^—]*—[^—]*5000 ₽/)
  })

  it('экранирует <, >, & для HTML parse_mode', () => {
    const order: Order = {
      ...baseOrder,
      customer: { ...baseOrder.customer, name: '<Иван & Петров>' },
    }
    const msg = buildTelegramMessage('o1', order, 100)
    // HTML-чувствительные символы экранированы
    expect(msg).toContain('&lt;Иван &amp; Петров&gt;')
    // А точка НЕ экранируется (HTML vs MarkdownV2)
    expect(msg).not.toContain('&lt;Иван &amp; Петров&gt;.')
  })

  it('корректно работает без опциональных полей (только minimum)', () => {
    const minimal: Order = {
      customer: {
        name: 'Мини',
        email: 'm@t.com',
        delivery: { type: 'pickup' },
      },
      purchase: { order: [{ id: 1, title: 'X', amount: 1, price: 1 }], createdAt: '2026-01-01T00:00:00.000Z' },
      totalPrice: 1,
    }
    const msg = buildTelegramMessage('ord_min', minimal, 1)
    expect(msg).toContain('Мини')
    expect(msg).toContain('X')
    expect(msg).toContain('1 ₽')
    expect(msg).toContain('Не указано') // default для messenger
  })
})