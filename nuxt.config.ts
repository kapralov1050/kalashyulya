import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      title: 'Code Editor',
    },
  },

  googleFonts: {
    display: 'swap',
    families: {
      'Open Sans': {
        wght: '300..800',
        ital: '300..800',
      },
    },
  },

  icon: {
    mode: 'svg',
    aliases: {
      code: 'heroicons:code-bracket-square-solid',
      cog: 'heroicons:cog-6-tooth',
      fire: 'heroicons:fire',
    },
  },

  i18n: {
    defaultLocale: 'ru',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    locales: [
      { code: 'en', name: 'En', file: 'en.json' },
      { code: 'ru', name: 'Ru', file: 'ru.json' },
    ],
  },
})
