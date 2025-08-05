import * as v from 'valibot'

export const loginSchema = v.object({
  email: v.pipe(v.string(), v.email('Некорректный email')),
  password: v.pipe(v.string(), v.minLength(6, 'Минимум 6 символов')),
})

export const registerSchema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email('Некорректный email')),
  password: v.pipe(v.string(), v.minLength(6, 'Минимум 6 символов')),
})

export const orderSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Введите имя')),
  email: v.pipe(v.string(), v.email('Некорректный email')),
  phone: v.pipe(v.string(), v.minLength(11, 'Номер телефона не корректен')),
  address: v.pipe(v.string(), v.minLength(1, 'Введите адрес')),
  comment: v.pipe(v.string(), v.minLength(1, 'Введите имя')),
})

export type loginSchemaType = v.InferOutput<typeof loginSchema>
export type registerSchemaType = v.InferOutput<typeof registerSchema>
export type orderSchemaType = v.InferOutput<typeof orderSchema>
