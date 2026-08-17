import { describe, it, expect } from 'vitest'
import * as v from 'valibot'
import {
  contactsSchema,
  deliverySchema,
  paymentSchema,
  checkoutSchema,
} from '../valibot'

interface IssueLike {
  path?: Array<{ key?: unknown }>
  message: string
}

type SafeResult = { success: true } | { success: false, issues: unknown }

function collectErrors(result: SafeResult): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!result.success) {
    for (const issue of (result.issues as IssueLike[])) {
      const key = issue.path?.[0]?.key
      if (typeof key === 'string' && !errors[key]) errors[key] = issue.message
    }
  }
  return errors
}

const validContactsBase = {
  name: 'Иван Иванов',
  email: 'test@example.com',
  phone: '',
  nickname: '',
  messengers: ['phone'] as ('vk' | 'tg' | 'phone')[],
}

const validDeliveryBase = {
  deliveryType: 'delivery' as const,
  recipient: '',
  address: '',
  region: '',
  city: '',
  street: '',
  house: '',
  apartment: '',
}

const validCheckoutBase = {
  ...validContactsBase,
  ...validDeliveryBase,
  framing: '',
  payment: '',
}

describe('contactsSchema', () => {
  it('valid: phone messenger with valid phone', () => {
    const result = v.safeParse(contactsSchema, {
      ...validContactsBase,
      messengers: ['phone'],
      phone: '+79991234567',
    })
    expect(result.success).toBe(true)
  })

  it('valid: vk messenger with nickname', () => {
    const result = v.safeParse(contactsSchema, {
      ...validContactsBase,
      messengers: ['vk'],
      nickname: 'id1',
    })
    expect(result.success).toBe(true)
  })

  it('invalid: name with 1 character', () => {
    const result = v.safeParse(contactsSchema, {
      ...validContactsBase,
      messengers: ['phone'],
      phone: '+79991234567',
      name: 'И',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.name).toContain('минимум 2 символа')
    }
  })

  it('invalid: name with digits', () => {
    const result = v.safeParse(contactsSchema, {
      ...validContactsBase,
      messengers: ['phone'],
      phone: '+79991234567',
      name: 'Иван123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.name).toContain('только буквы и пробелы')
    }
  })

  it('invalid: email without @', () => {
    const result = v.safeParse(contactsSchema, {
      ...validContactsBase,
      messengers: ['phone'],
      phone: '+79991234567',
      email: 'bademail',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.email).toBe('Некорректный email')
    }
  })

  it('invalid: empty messengers array', () => {
    const result = v.safeParse(contactsSchema, {
      ...validContactsBase,
      messengers: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.messengers).toBe('Выберите способ связи')
    }
  })

  it('conditional: vk messenger with empty nickname', () => {
    const result = v.safeParse(contactsSchema, {
      ...validContactsBase,
      messengers: ['vk'],
      nickname: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.nickname).toBe('Введите никнейм')
    }
  })

  it('conditional: vk messenger with 1-char nickname is valid', () => {
    const result = v.safeParse(contactsSchema, {
      ...validContactsBase,
      messengers: ['vk'],
      nickname: 'i',
    })
    expect(result.success).toBe(true)
  })

  it('conditional: vk messenger with whitespace-only nickname', () => {
    const result = v.safeParse(contactsSchema, {
      ...validContactsBase,
      messengers: ['vk'],
      nickname: '   ',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.nickname).toBe('Введите никнейм')
    }
  })

  it('conditional: phone messenger with empty phone', () => {
    const result = v.safeParse(contactsSchema, {
      ...validContactsBase,
      messengers: ['phone'],
      phone: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.phone).toContain('телефон')
    }
  })

  it('conditional: phone messenger with non-numeric phone', () => {
    const result = v.safeParse(contactsSchema, {
      ...validContactsBase,
      messengers: ['phone'],
      phone: 'abc',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.phone).toContain('телефон')
    }
  })

  it('conditional: phone+vk messengers with valid phone and 1-char nickname', () => {
    const result = v.safeParse(contactsSchema, {
      ...validContactsBase,
      messengers: ['phone', 'vk'],
      phone: '+79991234567',
      nickname: 'i',
    })
    expect(result.success).toBe(true)
  })

  it('multiple errors: short name, bad email, empty messengers', () => {
    const result = v.safeParse(contactsSchema, {
      name: 'X',
      email: 'bad',
      phone: '',
      nickname: '',
      messengers: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.name).toContain('минимум 2 символа')
      expect(errors.email).toBe('Некорректный email')
      expect(errors.messengers).toBe('Выберите способ связи')
    }
  })
})

describe('deliverySchema', () => {
  it('valid: pickup with empty fields', () => {
    const result = v.safeParse(deliverySchema, {
      ...validDeliveryBase,
      deliveryType: 'pickup',
    })
    expect(result.success).toBe(true)
  })

  it('valid: delivery with all fields filled', () => {
    const result = v.safeParse(deliverySchema, {
      ...validDeliveryBase,
      deliveryType: 'delivery',
      recipient: 'Иван Иванов',
      city: 'Москва',
      street: 'Ленина',
      house: '5',
      apartment: '12',
    })
    expect(result.success).toBe(true)
  })

  it('invalid: delivery with empty city', () => {
    const result = v.safeParse(deliverySchema, {
      ...validDeliveryBase,
      deliveryType: 'delivery',
      recipient: 'Иван Иванов',
      city: '',
      street: 'Ленина',
      house: '5',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.city).toBe('Введите город')
    }
  })

  it('invalid: delivery with empty recipient', () => {
    const result = v.safeParse(deliverySchema, {
      ...validDeliveryBase,
      deliveryType: 'delivery',
      recipient: '',
      city: 'Москва',
      street: 'Ленина',
      house: '5',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.recipient).toBe('Введите имя и фамилию получателя')
    }
  })

  it('invalid: delivery with empty street', () => {
    const result = v.safeParse(deliverySchema, {
      ...validDeliveryBase,
      deliveryType: 'delivery',
      recipient: 'Иван Иванов',
      city: 'Москва',
      street: '',
      house: '5',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.street).toBe('Введите улицу')
    }
  })

  it('invalid: delivery with both empty house and apartment', () => {
    const result = v.safeParse(deliverySchema, {
      ...validDeliveryBase,
      deliveryType: 'delivery',
      recipient: 'Иван Иванов',
      city: 'Москва',
      street: 'Ленина',
      house: '',
      apartment: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.house).toBe('Введите дом или квартиру')
    }
  })

  it('valid: delivery with only house set', () => {
    const result = v.safeParse(deliverySchema, {
      ...validDeliveryBase,
      deliveryType: 'delivery',
      recipient: 'Иван Иванов',
      city: 'Москва',
      street: 'Ленина',
      house: '5',
      apartment: '',
    })
    expect(result.success).toBe(true)
  })

  it('valid: delivery with only apartment set', () => {
    const result = v.safeParse(deliverySchema, {
      ...validDeliveryBase,
      deliveryType: 'delivery',
      recipient: 'Иван Иванов',
      city: 'Москва',
      street: 'Ленина',
      house: '',
      apartment: '5',
    })
    expect(result.success).toBe(true)
  })

  it('invalid: delivery with single-word recipient', () => {
    const result = v.safeParse(deliverySchema, {
      ...validDeliveryBase,
      deliveryType: 'delivery',
      recipient: 'Иван',
      city: 'Москва',
      street: 'Ленина',
      house: '5',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.recipient).toBe('Введите имя и фамилию получателя')
    }
  })

  it('invalid: delivery with 1-char city', () => {
    const result = v.safeParse(deliverySchema, {
      ...validDeliveryBase,
      deliveryType: 'delivery',
      recipient: 'Иван Иванов',
      city: 'М',
      street: 'Ленина',
      house: '5',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.city).toBe('Город должен содержать минимум 2 символа')
    }
  })
})

describe('paymentSchema', () => {
  it('valid: empty payment', () => {
    const result = v.safeParse(paymentSchema, { payment: '' })
    expect(result.success).toBe(true)
  })

  it('valid: yookassa payment', () => {
    const result = v.safeParse(paymentSchema, { payment: 'yookassa' })
    expect(result.success).toBe(true)
  })

  it('valid: manual payment', () => {
    const result = v.safeParse(paymentSchema, { payment: 'manual' })
    expect(result.success).toBe(true)
  })

  it('invalid: unknown payment method', () => {
    const result = v.safeParse(paymentSchema, { payment: 'other' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.payment).toBeDefined()
      expect(errors.payment).not.toBe('')
    }
  })
})

describe('checkoutSchema', () => {
  it('valid: full form with delivery', () => {
    const result = v.safeParse(checkoutSchema, {
      ...validCheckoutBase,
      messengers: ['phone'],
      phone: '+79991234567',
      deliveryType: 'delivery',
      recipient: 'Иван Иванов',
      city: 'Москва',
      street: 'Ленина',
      house: '5',
    })
    expect(result.success).toBe(true)
  })

  it('invalid: name with 1 character', () => {
    const result = v.safeParse(checkoutSchema, {
      ...validCheckoutBase,
      messengers: ['phone'],
      phone: '+79991234567',
      name: 'И',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.name).toContain('минимум 2 символа')
    }
  })

  it('valid: payment empty with everything else valid', () => {
    const result = v.safeParse(checkoutSchema, {
      ...validCheckoutBase,
      deliveryType: 'pickup',
      messengers: ['phone'],
      phone: '+79991234567',
      payment: '',
    })
    expect(result.success).toBe(true)
  })

  it('invalid: vk messenger with empty nickname', () => {
    const result = v.safeParse(checkoutSchema, {
      ...validCheckoutBase,
      messengers: ['vk'],
      nickname: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.nickname).toBe('Введите никнейм')
    }
  })

  it('invalid: phone messenger with empty phone', () => {
    const result = v.safeParse(checkoutSchema, {
      ...validCheckoutBase,
      messengers: ['phone'],
      phone: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = collectErrors(result)
      expect(errors.phone).toContain('телефон')
    }
  })
})
