export const CHECKOUT_STEPS = [
  {
    id: 'contacts',
    label: 'Шаг первый',
    title: 'Ваши данные',
    description: 'Укажите контактную информацию для связи',
  },
  {
    id: 'delivery',
    label: 'Шаг второй',
    title: 'Доставка',
    description: 'Выберите удобный способ получения',
  },
  {
    id: 'framing',
    label: 'Шаг третий',
    title: 'Оформление',
    description: 'Добавьте рамку или другое оформление для вашей работы',
  },
  {
    id: 'summary',
    label: 'Шаг четвёртый',
    title: 'Ваш заказ',
    description: 'Проверьте всё перед оплатой',
  },
  {
    id: 'payment',
    label: 'Шаг пятый',
    title: 'Оплата',
    description: 'Выберите удобный способ оплаты',
  },
] as const

export type CheckoutStepId = (typeof CHECKOUT_STEPS)[number]['id']
