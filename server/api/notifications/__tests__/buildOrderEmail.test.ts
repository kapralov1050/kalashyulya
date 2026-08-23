import { describe, expect, it, beforeEach, afterEach } from 'vitest'
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
    order: [
      { id: 1, title: 'Картина', amount: 2, price: 5000 },
    ],
    createdAt: '2026-08-18T12:00:00.000Z',
  },
  totalPrice: 10000,
  framing: 'simple',
  paymentMethod: 'manual',
}

describe('buildOrderEmail', () => {
  beforeEach(() => {
    process.env.EMAIL_USER = 'shop@kalashyulya.ru'
  })
  afterEach(() => {
    delete process.env.EMAIL_USER
  })

  it('шлёт письмо админу (EMAIL_USER), а не покупателю', () => {
    const { to } = buildOrderEmail(baseOrder)
    expect(to).toBe('shop@kalashyulya.ru')
  })

  it('формирует subject "Новый заказ от <name>"', () => {
    const { subject } = buildOrderEmail(baseOrder)
    expect(subject).toBe('Новый заказ от Мария')
  })

  it('выбрасывает ошибку, если EMAIL_USER не задан', () => {
    delete process.env.EMAIL_USER
    expect(() => buildOrderEmail(baseOrder)).toThrow(/EMAIL_USER/)
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
    const { html } = buildOrderEmail(malicious)
    expect(html).not.toContain('<script>alert("x")</script>')
    expect(html).not.toContain('<b>Иван</b>')
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')
    expect(html).toContain('&lt;b&gt;Иван&lt;/b&gt;')
    expect(html).toContain('&quot;&amp;&lt;&gt;&quot;&#039;')
  })

  it('экранирует HTML в имени, email, мессенджере и нике', () => {
    const malicious: Order = {
      ...baseOrder,
      customer: {
        ...baseOrder.customer,
        name: '<img src=x onerror=alert(1)>',
        email: '"><svg/onload=alert(1)>',
        userMessenger: 'Telegram & Co',
        userNickname: '<b>nick</b>',
      },
    }
    const { html } = buildOrderEmail(malicious)
    expect(html).not.toContain('<img src=x onerror=alert(1)>')
    expect(html).not.toContain('<svg/onload=alert(1)>')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).toContain('Telegram &amp; Co')
    expect(html).toContain('&lt;b&gt;nick&lt;/b&gt;')
  })

  it('рендерит ветку pickup без полей доставки', () => {
    const pickup: Order = {
      ...baseOrder,
      customer: {
        ...baseOrder.customer,
        delivery: { type: 'pickup' },
      },
    }
    const { html } = buildOrderEmail(pickup)
    expect(html).toContain('Самовывоз (Санкт-Петербург)')
    expect(html).not.toContain('Невский 1')
  })

  it('рендерит ветку delivery с городом/получателем/адресом', () => {
    const { html } = buildOrderEmail(baseOrder)
    expect(html).toContain('<b>Город:</b> СПб')
    expect(html).toContain('<b>Получатель:</b> Мария Иванова')
    expect(html).toContain('<b>Адрес:</b> Невский 1')
  })

  it('экранирует название товара', () => {
    const item: Order = {
      ...baseOrder,
      purchase: {
        ...baseOrder.purchase,
        order: [{ id: 1, title: '<script>bad</script>', amount: 1, price: 100 }],
      },
    }
    const { html } = buildOrderEmail(item)
    expect(html).not.toContain('<script>bad</script>')
    expect(html).toContain('&lt;script&gt;bad&lt;/script&gt;')
  })

  it('локализует framing и paymentMethod', () => {
    const { html } = buildOrderEmail(baseOrder)
    expect(html).toContain('Рама с паспарту')
    expect(html).toContain('Перевод вручную')
  })
})
