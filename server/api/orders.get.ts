import type { OrderInBase } from '~/types'

const mockOrders: OrderInBase[] = [
  {
    id: 1700000000000,
    status: 'paid',
    customer: {
      name: 'Иван Иванов',
      email: 'ivan@example.com',
      phone: '+79991234567',
      userMessenger: 'Телеграм',
      userNickname: '@ivan',
      delivery: {
        type: 'pickup',
        city: 'Москва',
        recipient: 'Иван Иванов',
        address: 'ул. Пушкина, д. 10',
      },
    },
    purchase: {
      order: [
        { amount: 1, title: 'Акварель "Море"', price: 5000 },
      ],
      createdAt: '2026-01-15T10:30:00.000Z',
    },
    totalPrice: 5000,
    paymentMethod: 'yookassa',
    paymentId: 'yookassa_1700000000000',
  },
  {
    id: 1700000100000,
    status: 'Новый заказ',
    customer: {
      name: 'Мария Петрова',
      email: 'maria@example.com',
      phone: '+79997654321',
      userMessenger: 'Вконтакте',
      delivery: {
        type: 'delivery',
        city: 'Санкт-Петербург',
        recipient: 'Мария Петрова',
        address: 'Невский проспект, д. 1',
      },
    },
    purchase: {
      order: [
        { amount: 2, title: 'Открытка "Зима"', price: 350 },
      ],
      createdAt: '2026-02-20T14:15:00.000Z',
    },
    totalPrice: 700,
    paymentMethod: 'manual',
    framing: 'simple',
  },
]

export default defineEventHandler((): OrderInBase[] => {
  try {
    return mockOrders
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Не удалось загрузить заказы' })
  }
})
