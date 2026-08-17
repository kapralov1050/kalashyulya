import * as v from 'valibot'

const requiredText = (message: string) => v.pipe(v.string(), v.trim(), v.minLength(1, message))
const optionalText = v.optional(v.string())
const nameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(2, 'Имя должно содержать минимум 2 символа'),
  v.regex(/^[A-Za-zА-Яа-яЁё\s]+$/, 'Имя может содержать только буквы и пробелы'),
)
const phoneSchema = v.pipe(
  v.string(),
  v.trim(),
  v.regex(/^\+?[0-9]{10,15}$/, 'Введите телефон в формате +79999999999'),
)
const nicknameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, 'Введите никнейм'),
)
const recipientSchema = v.pipe(
  v.string(),
  v.trim(),
  v.check(
    value => value.split(/\s+/).filter(word => /^[A-Za-zА-Яа-яЁё-]+$/.test(word)).length >= 2,
    'Введите имя и фамилию получателя',
  ),
)

export const loginSchema = v.object({
  email: v.pipe(v.string(), v.email('Некорректный email')),
  password: v.pipe(v.string(), v.minLength(6, 'Минимум 6 символов')),
})

export const contactsSchema = v.pipe(
  v.object({
    name: nameSchema,
    email: v.pipe(v.string(), v.trim(), v.minLength(1, 'Введите email'), v.email('Некорректный email')),
    phone: optionalText,
    nickname: optionalText,
    messengers: v.pipe(v.array(v.picklist(['vk', 'tg', 'phone'])), v.minLength(1, 'Выберите способ связи')),
  }),
  v.rawCheck(({ dataset, addIssue }) => {
    if (!dataset.typed) return
    const { messengers, nickname, phone } = dataset.value
    if (messengers.includes('phone')) {
      const result = v.safeParse(phoneSchema, phone)
      if (!result.success) addIssue({ message: result.issues[0].message, path: [{ type: 'object', origin: 'value', input: dataset.value, key: 'phone', value: phone }] })
    }
    if (messengers.some(messenger => messenger === 'vk' || messenger === 'tg')) {
      const result = v.safeParse(nicknameSchema, nickname)
      if (!result.success) addIssue({ message: result.issues[0].message, path: [{ type: 'object', origin: 'value', input: dataset.value, key: 'nickname', value: nickname }] })
    }
  }),
)

export const deliverySchema = v.pipe(
  v.object({
    deliveryType: v.picklist(['pickup', 'delivery']),
    recipient: optionalText,
    address: optionalText,
    region: optionalText,
    city: optionalText,
    street: optionalText,
    house: optionalText,
    apartment: optionalText,
  }),
  v.rawCheck(({ dataset, addIssue }) => {
    if (!dataset.typed || dataset.value.deliveryType === 'pickup') return
    const checks = [
      ['recipient', recipientSchema, dataset.value.recipient],
      ['city', v.pipe(requiredText('Введите город'), v.minLength(2, 'Город должен содержать минимум 2 символа')), dataset.value.city],
      ['street', requiredText('Введите улицу'), dataset.value.street],
    ] as const
    for (const [key, schema, value] of checks) {
      const result = v.safeParse(schema, value)
      if (!result.success) addIssue({ message: result.issues[0].message, path: [{ type: 'object', origin: 'value', input: dataset.value, key, value }] })
    }
    if (!dataset.value.house.trim() && !dataset.value.apartment.trim()) {
      addIssue({ message: 'Введите дом или квартиру', path: [{ type: 'object', origin: 'value', input: dataset.value, key: 'house', value: dataset.value.house }] })
    }
  }),
)

export const paymentSchema = v.object({
  payment: v.union([v.literal(''), v.picklist(['yookassa', 'manual'], 'Выберите способ оплаты')]),
})

export const checkoutSchema = v.pipe(
  v.object({
    name: nameSchema,
    email: v.pipe(v.string(), v.trim(), v.minLength(1, 'Введите email'), v.email('Некорректный email')),
    phone: optionalText,
    nickname: optionalText,
    messengers: v.pipe(v.array(v.picklist(['vk', 'tg', 'phone'])), v.minLength(1, 'Выберите способ связи')),
    deliveryType: v.picklist(['pickup', 'delivery']),
    recipient: optionalText,
    address: optionalText,
    region: optionalText,
    city: optionalText,
    street: optionalText,
    house: optionalText,
    apartment: optionalText,
    framing: v.optional(v.union([v.literal(''), v.picklist(['none', 'simple', 'premium'])])),
    payment: v.union([v.literal(''), v.picklist(['yookassa', 'manual'])]),
  }),
  v.rawCheck(({ dataset, addIssue }) => {
    if (!dataset.typed) return
    const contacts = v.safeParse(contactsSchema, dataset.value)
    const delivery = v.safeParse(deliverySchema, dataset.value)
    const payment = v.safeParse(paymentSchema, dataset.value)
    for (const result of [contacts, delivery, payment]) {
      if (!result.success) {
        for (const issue of result.issues) addIssue({ message: issue.message, path: issue.path })
      }
    }
  }),
)

export const orderSchema = checkoutSchema

export const productSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1, 'Введите название')),
})

export type loginSchemaType = v.InferOutput<typeof loginSchema>
export type contactsSchemaType = v.InferOutput<typeof contactsSchema>
export type deliverySchemaType = v.InferOutput<typeof deliverySchema>
export type paymentSchemaType = v.InferOutput<typeof paymentSchema>
export type checkoutSchemaType = v.InferOutput<typeof checkoutSchema>
export type orderSchemaType = v.InferOutput<typeof orderSchema>
export type productSchemaType = v.InferOutput<typeof productSchema>
