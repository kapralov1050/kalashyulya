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
}

describe('buildTelegramMessage', () => {
  it('содержит id заказа и итоговую сумму', () => {
    const msg = buildTelegramMessage('order_42', baseOrder, 10200)
    expect(msg).toContain('order_42')
    expect(msg).toContain('10200')
    expect(msg).toContain('10200 ₽')
  })

  it('содержит имя, телефон и email покупателя', () => {
    const msg = buildTelegramMessage('o1', baseOrder, 10200)
    expect(msg).toContain('Иван Петров')
    expect(msg).toContain('+79991234567')
    // Спецсимволы MarkdownV2 экранированы (\. для точки в email)
    expect(msg).toContain('ivan@test\\.com')
  })

  it('содержит все позиции заказа с ценами', () => {
    const msg = buildTelegramMessage('o1', baseOrder, 10200)
    expect(msg).toContain('Акварель')
    expect(msg).toContain('2 шт.')
    expect(msg).toContain('5000 ₽')
    expect(msg).toContain('Открытка')
    expect(msg).toContain('1 шт.')
    expect(msg).toContain('200 ₽')
  })

  it('экранирует спецсимволы MarkdownV2', () => {
    const order: Order = {
      ...baseOrder,
      customer: {
        ...baseOrder.customer,
        name: 'Тест_Имя.Спец*',
      },
    }
    const msg = buildTelegramMessage('o1', order, 100)
    // Спецсимволы экранированы обратным слэшем
    expect(msg).toContain('Тест\\_Имя\\.Спец\\*')
    expect(msg).not.toContain('Тест_Имя.Спец*')
  })

  it('корректно работает без опциональных полей', () => {
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
  })
})
