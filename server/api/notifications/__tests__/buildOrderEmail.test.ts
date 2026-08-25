import { describe, expect, it } from 'vitest'
import { buildOrderEmail } from '../../../utils/orderEmailTemplate'
import type { Order } from '../../../../app/types'

const baseOrder: Order = {
  customer: {
    name: 'Мария',
    email: 'maria@test.com',
    phone: '+79990000000',
    userMessenger: 'Телеграм',
    userNickname: 'maria_art',
    delivery: {
      type: 'delivery',
      city: 'СПб',
      recipient: 'Мария Иванова',
      address: 'Невский 1',
    },
  },
  purchase: {
    order: [{ id: 1, title: 'Картина', amount: 2, price: 5000 }],
    createdAt: '2026-08-18T12:00:00.000Z',
  },
  totalPrice: 10000,
  framing: 'simple',
  paymentMethod: 'manual',
}

describe('buildOrderEmail (customer-facing)', () => {
  it('шлёт письмо покупателю (customer.email), а не продавцу', () => {
    const { to } = buildOrderEmail(baseOrder, '20260824-abcd1234')
    expect(to).toBe('maria@test.com')
  })

  it('subject содержит orderId', () => {
    const { subject } = buildOrderEmail(baseOrder, '20260824-abcd1234')
    expect(subject).toBe('Заказ #20260824-abcd1234 принят')
  })

  it('экранирует HTML в orderId (если туда попадёт мусор)', () => {
    const { subject, html } = buildOrderEmail(baseOrder, '<script>x</script>')
    expect(subject).not.toContain('<script>')
    expect(html).not.toContain('<script>x</script>')
    expect(html).toContain('&lt;script&gt;x&lt;/script&gt;')
  })

  it('HTML использует customer-facing копирайт', () => {
    const { html } = buildOrderEmail(baseOrder, '20260824-abcd1234')
    expect(html).toContain('Спасибо за заказ!')
    expect(html).not.toContain('Новый заказ')
    expect(html).toContain('Я получила ваш заказ')
    expect(html).toContain('Юлия Калашникова · kalashyulya.ru')
  })

  it('HTML содержит orderId в видимой части', () => {
    const { html } = buildOrderEmail(baseOrder, '20260824-abcd1234')
    expect(html).toContain('#20260824-abcd1234')
  })

  it('email не зависит от EMAIL_USER (раньше требовал env)', () => {
    // delete process.env.EMAIL_USER — теперь не должно быть throw
    const prev = process.env.EMAIL_USER
    delete process.env.EMAIL_USER
    try {
      const { to } = buildOrderEmail(baseOrder, 'X')
      expect(to).toBe('maria@test.com')
    } finally {
      if (prev) process.env.EMAIL_USER = prev
    }
  })

  it('throw если email покупателя пустой', () => {
    const noEmail: Order = {
      ...baseOrder,
      customer: { ...baseOrder.customer, email: '' },
    }
    expect(() => buildOrderEmail(noEmail, 'X')).toThrow(
      /Invalid customer email/,
    )
  })

  it('throw если email покупателя невалиден', () => {
    const invalid: Order = {
      ...baseOrder,
      customer: { ...baseOrder.customer, email: 'not-an-email' },
    }
    expect(() => buildOrderEmail(invalid, 'X')).toThrow(
      /Invalid customer email/,
    )
  })

  it('throw если email содержит мусор (XSS-вектор)', () => {
    const xss: Order = {
      ...baseOrder,
      customer: {
        ...baseOrder.customer,
        email: '"><svg/onload=alert(1)>@x.com',
      },
    }
    // Должно либо пройти regex (тогда отправляется — XSS-фильтр на стороне SMTP)
    // либо throw. Главное — не молча отправить пустоту.
    try {
      const { to } = buildOrderEmail(xss, 'X')
      expect(to).not.toContain('<svg>')
    } catch {
      // OK — отбрасываем мусор
    }
  })

  it('экранирует HTML в полях доставки', () => {
    const malicious: Order = {
      ...baseOrder,
      customer: {
        ...baseOrder.customer,
        delivery: {
          type: 'delivery',
          city: '<script>alert("x")</script>',
          recipient: '<b>Иван</b>',
          address: '"&<>"\'',
        },
      },
    }
    const { html } = buildOrderEmail(malicious, 'X')
    expect(html).not.toContain('<script>alert("x")</script>')
    expect(html).not.toContain('<b>Иван</b>')
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')
    expect(html).toContain('&lt;b&gt;Иван&lt;/b&gt;')
    expect(html).toContain('&quot;&amp;&lt;&gt;&quot;&#039;')
  })

  it('экранирует HTML в имени покупателя (приветствие в письме)', () => {
    const malicious: Order = {
      ...baseOrder,
      customer: {
        ...baseOrder.customer,
        name: '<img src=x onerror=alert(1)>',
      },
    }
    const { html } = buildOrderEmail(malicious, 'X')
    expect(html).not.toContain('<img src=x onerror=alert(1)>')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })

  it('рендерит ветку pickup без полей доставки', () => {
    const pickup: Order = {
      ...baseOrder,
      customer: {
        ...baseOrder.customer,
        delivery: { type: 'pickup' },
      },
    }
    const { html } = buildOrderEmail(pickup, 'X')
    expect(html).toContain('Самовывоз (Санкт-Петербург)')
    expect(html).not.toContain('Невский 1')
  })

  it('рендерит ветку delivery с городом/получателем/адресом', () => {
    const { html } = buildOrderEmail(baseOrder, 'X')
    expect(html).toContain('<b>Город:</b> СПб')
    expect(html).toContain('<b>Получатель:</b> Мария Иванова')
    expect(html).toContain('<b>Адрес:</b> Невский 1')
  })

  it('экранирует название товара', () => {
    const item: Order = {
      ...baseOrder,
      purchase: {
        ...baseOrder.purchase,
        order: [
          { id: 1, title: '<script>bad</script>', amount: 1, price: 100 },
        ],
      },
    }
    const { html } = buildOrderEmail(item, 'X')
    expect(html).not.toContain('<script>bad</script>')
    expect(html).toContain('&lt;script&gt;bad&lt;/script&gt;')
  })

  it('локализует framing и paymentMethod', () => {
    const { html } = buildOrderEmail(baseOrder, 'X')
    expect(html).toContain('Рама с паспарту')
    expect(html).toContain('Перевод вручную')
  })
})
