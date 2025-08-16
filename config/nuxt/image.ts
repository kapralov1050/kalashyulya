import type { NuxtConfig } from 'nuxt/config'

export const imageConfig: NuxtConfig['image'] = {
  quality: 85,
  format: ['webp', 'avif'],
  // Оптимизация для SEO
  dangerouslyAllowSVG: true,
  // Оптимизация для ленивой загрузки
  lazy: true,
  // Оптимизация для предварительной загрузки
  preload: true,
  // Включение плагина для оптимизации изображений
  nuxtImage: {
    // Оптимизация для художественного контента
    format: ['webp', 'avif'],
    quality: 85,
    // Адаптивные размеры
    sizes: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
  },
}
