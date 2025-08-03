import type { NuxtConfig } from 'nuxt/config'

export const googleFontsConfig: NuxtConfig['googleFonts'] = {
  display: 'swap',
  families: {
    'Open Sans': {
      wght: '300..800',
      ital: '300..800',
    },
  },
}
