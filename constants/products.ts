/**
 * Константы категорий продуктов
 */
export const ProductCategory = {
  PICTURES: '1',
  SKETCHES: '2',
  POSTCARDS: '3',
  STICKERS: '4',
  CALENDARS: '5',
} as const

/**
 * Локализованные названия категорий продуктов
 */
export const ProductCategoryLabels = {
  [ProductCategory.PICTURES]: 'Картины',
  [ProductCategory.SKETCHES]: 'Этюды',
  [ProductCategory.POSTCARDS]: 'Открытки',
  [ProductCategory.STICKERS]: 'Стикерпаки',
  [ProductCategory.CALENDARS]: 'Календари',
} as const

/**
 * Получить название категории по её ID
 */
export function getCategoryLabel(categoryId: string): string {
  return ProductCategoryLabels[categoryId as keyof typeof ProductCategoryLabels] || 'Неизвестная категория'
}

/**
 * Проверить, является ли категория календарями
 * (календари не поддерживают лупу для увеличения)
 */
export function isCalendarCategory(categoryId: string): boolean {
  return categoryId === ProductCategory.CALENDARS
}

/**
 * Получить текстовое описание типа товара по категории
 */
export function getProductTypeLabel(categoryId: string): string {
  const labels: Record<string, string> = {
    [ProductCategory.PICTURES]: 'Оригинальная работа',
    [ProductCategory.SKETCHES]: 'Оригинальный этюд',
    [ProductCategory.POSTCARDS]: 'Авторская открытка',
    [ProductCategory.STICKERS]: 'Авторский стикерпак',
    [ProductCategory.CALENDARS]: 'Авторские календари',
  }
  return labels[categoryId] || ''
}

export type ProductCategoryId = typeof ProductCategory[keyof typeof ProductCategory]
