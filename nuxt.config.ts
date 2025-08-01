import tailwindcss from '@tailwindcss/vite'
import { buildVuefire } from './config/nuxt/buildVuefire'

export default defineNuxtConfig({
  ssr: false,
  runtimeConfig: {
    public: {
      cloudFunctionTelegramUrl:
        process.env.NUXT_PUBLIC_CLOUD_FUNCTION_TELEGRAM_URL,
      cloudFunctionEmailUrl: process.env.NUXT_PUBLIC_CLOUD_FUNCTION_EMAIL_URL,
      adminUid: process.env.NUXT_PUBLIC_ADMIN_UID,
    },
  },
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
    '@nuxt/image',
    'nuxt-vuefire',
    '@vueuse/nuxt',
  ],

  vuefire: buildVuefire(),
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
