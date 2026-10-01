import { ProductCategory } from '~/constants/products'
import type { Product } from '~/types'

const productNumber = (product: Product) =>
  Number(String(product.id).replace(/\D/g, '')) || 0

export function selectFeaturedWorks(products: Product[], count = 6): Product[] {
  return products
    .filter(
      product =>
        product.categoryId === ProductCategory.PICTURES &&
        product.stock > 0 &&
        !product.isReserved,
    )
    .sort(
      (a, b) =>
        Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0) ||
        productNumber(b) - productNumber(a),
    )
    .slice(0, count)
}
