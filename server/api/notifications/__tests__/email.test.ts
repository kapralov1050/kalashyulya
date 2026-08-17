import { describe, expect, it } from 'vitest'
import {
  buildStatusEmailHtml,
  buildStatusEmailPayload,
} from '../../../utils/statusEmailTemplate'
import type { OrderInBase } from '../../../../app/types'

const order: OrderInBase = {
  id: 101,
  status: 'paid',
  customer: {
    name: 'Мария',
    email: 'maria@test.com',
    phone: '+79990000000',
    delivery: {
      type: 'delivery',
      city: 'СПб',
      address: 'Невский 1',
    },
  },
  purchase: {
    order: [
      { id: 1, title: 'Картина', amount: 1, price: 7000 },
    ],
    createdAt: '2026-08-18T12:00:00.000Z',
  },
  totalPrice: 7000,
}

describe('buildStatusEmailPayload', () => {
  it('транслирует OrderInBase в плоский DTO для email', () => {
    const payload = buildStatusEmailPayload(order, 'paid', 'Спасибо!')
    expect(payload.to).toBe('maria@test.com')
    expect(payload.customerName).toBe('Мария')
    expect(payload.orderId).toBe(101)
    expect(payload.newStatus).toBe('paid')
    expect(payload.totalPrice).toBe(7000)
    expect(payload.customMessage).toBe('Спасибо!')
    expect(payload.orderItems).toEqual([
      { title: 'Картина', amount: 1, price: 7000, total: 7000 },
    ])
  })

  it('использует fallback имя, если оно пустое', () => {
    const payload = buildStatusEmailPayload(
      { ...order, customer: { ...order.customer, name: '' } },
      'shipped',
    )
    expect(payload.customerName).toBe('Уважаемый клиент')
  })
})

describe('buildStatusEmailHtml', () => {
  it('содержит имя клиента и ID заказа', () => {
    const payload = buildStatusEmailPayload(order, 'paid')
    const html = buildStatusEmailHtml(payload)
    expect(html).toContain('Мария')
    expect(html).toContain('#101')
    expect(html).toContain('paid')
    expect(html).toContain('7000')
  })

  it('экранирует HTML в customMessage', () => {
    const payload = buildStatusEmailPayload(
      order,
      'paid',
      '<script>alert(1)</script>',
    )
    const html = buildStatusEmailHtml(payload)
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('включает блок customMessage только если он задан', () => {
    const noCustom = buildStatusEmailHtml(buildStatusEmailPayload(order, 'paid'))
    expect(noCustom).not.toContain('white-space: pre-wrap')

    const withCustom = buildStatusEmailHtml(
      buildStatusEmailPayload(order, 'paid', 'msg'),
    )
    expect(withCustom).toContain('white-space: pre-wrap')
  })
})
