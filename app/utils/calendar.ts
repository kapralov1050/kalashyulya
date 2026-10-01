import type { Product } from '~/types'

export const calendarAnchorId = (calendar: Pick<Product, 'id'>) =>
  `calendar-${String(calendar.id)}`
