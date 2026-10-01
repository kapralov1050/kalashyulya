import type { Product } from '~/types'

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

export const formatPrice = (price: number): string =>
  priceFormatter.format(price)

export const parseProductSize = (
  size?: string,
): { height: number; width: number } | null => {
  const [height, width] = (size || '')
    .split('*')
    .map(part => Number.parseFloat(part.replace(',', '.')))

  return height && width ? { height, width } : null
}

export const getArtworkAspectRatio = (size?: string): string => {
  const parsed = parseProductSize(size)
  return parsed ? `auto ${parsed.width} / ${parsed.height}` : 'auto 4 / 3'
}

export const formatProductSize = (size?: string): string => {
  const value = size?.trim().replace(/\s*\*\s*/g, ' × ')
  return value ? `${value} см` : ''
}

export const formatProductDetails = (
  product: Pick<Product, 'material' | 'size' | 'year'>,
): string =>
  [product.material?.trim(), formatProductSize(product.size), product.year]
    .filter(Boolean)
    .join(' · ')
