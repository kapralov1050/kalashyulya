import type { NuxtConfig } from 'nuxt/config'

export const imageConfig: NuxtConfig['image'] = {
  provider: 'ipx',
  quality: 80,
  format: ['webp', 'avif'],
  // Оптимизация для SEO
  dangerouslyAllowSVG: true,
  // Оптимизация для ленивой загрузки
  lazy: true,
  // Оптимизация для предварительной загрузки
  preload: true,
  // Адаптивные размеры для генерации srcset
  screens: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
    '3xl': 1920,
  },
  // Включение плагина для оптимизации изображений
  nuxtImage: {
    // Оптимизация для художественного контента
    format: ['webp', 'avif'],
    quality: 80,
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
  // Предустановки для часто используемых размеров
  presets: {
    avatar: {
      modifiers: {
        format: 'webp',
        width: 80,
        height: 80,
        quality: 80,
      },
    },
    thumbnail: {
      modifiers: {
        format: 'webp',
        width: 320,
        quality: 80,
      },
    },
    card: {
      modifiers: {
        format: 'webp',
        width: 640,
        quality: 80,
      },
    },
    hero: {
      modifiers: {
        format: 'webp',
        width: 1280,
        quality: 80,
      },
    },
  },
}
