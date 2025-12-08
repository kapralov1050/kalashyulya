import type { NuxtConfig } from 'nuxt/config'

export const imageConfig: NuxtConfig['image'] = {
  provider: 'ipx',
  quality: 80,
  formats: ['webp', 'avif', 'png', 'jpg'],
  dangerouslyAllowSVG: true,

  screens: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
    '3xl': 1920,
  },

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
        height: 180,
        fit: 'cover',
        quality: 80,
      },
    },
    card: {
      modifiers: {
        format: 'webp',
        width: 640,
        height: 360,
        fit: 'cover',
        quality: 80,
      },
    },
    hero: {
      modifiers: {
        format: 'webp',
        width: 1280,
        height: 720,
        fit: 'cover',
        quality: 80,
      },
    },
    retina: {
      modifiers: {
        format: 'webp',
        width: 1920,
        height: 1080,
        quality: 75,
      },
    },
  },
}
