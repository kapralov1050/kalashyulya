/**
 * Определяет, нужно ли слать аналитику/трекать действия.
 *
 * На prod-домене (kalashyulya.ru) — трекаем.
 * На localhost, 127.0.0.1, kalashyulya.vercel.app — НЕ трекаем (dev/preview).
 *
 * Используется в:
 * - app/utils/metrics.ts — отключает отправку Yandex.Metrika
 * - app/composables/useProductViews.ts — отключает инкремент views
 * - любые другие dev-only side effects
 */

export function isDevOrPreview(): boolean {
  if (typeof window === 'undefined') return false
  const { hostname, href } = window.location
  return (
    hostname === 'localhost'
    || hostname.startsWith('127.0.0.1')
    || href.includes('kalashyulya.vercel.app')
  )
}