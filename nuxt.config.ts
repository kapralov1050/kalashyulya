import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  routeRules: {
    '/shop/**': { ssr: false },
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

  vuefire: {
    config: {
      apiKey: 'AIzaSyCd6RtL-I9Az59wKV_aWbhOk7PKX03Rt-c',
      authDomain: 'kalashyulya-lessons.firebaseapp.com',
      databaseURL:
        'https://kalashyulya-lessons-default-rtdb.europe-west1.firebasedatabase.app',
      projectId: 'kalashyulya-lessons',
      storageBucket: 'kalashyulya-lessons.firebasestorage.app',
      messagingSenderId: '30642592130',
      appId: '1:30642592130:web:4fc2962c7af0e90c26179b',
      measurementId: 'G-8RTY5DXRHG',
    },
    services: {
      database: true,
    },
  },
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
