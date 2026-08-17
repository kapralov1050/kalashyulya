import type { NuxtConfig } from 'nuxt/config'

// Тип NuxtConfig['googleFonts'] не расширен в .nuxt/ — кастуем вручную.
interface GoogleFontsConfig {
  display?: string
  families?: Record<string, { wght?: string, ital?: string }>
}

export const googleFontsConfig: GoogleFontsConfig = {
  display: 'swap',
  families: {
    Montserrat: {
      wght: '300..800',
      ital: '300..800',
    },
  },
}
