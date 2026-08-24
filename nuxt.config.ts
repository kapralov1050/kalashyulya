import { appConfig } from './config/nuxt/app'
import { iconConfig } from './config/nuxt/icon'
import { modulesConfig } from './config/nuxt/modules'
import { runtimeConfig } from './config/nuxt/runtimeConfig'
import { viteConfig } from './config/nuxt/vite'

export default defineNuxtConfig({
  ssr: false,
  nitro: {
    // preset: 'vercel' для preview на Vercel (UI-only), 'node-server' для VPS prod.
    // Задаётся через NITRO_PRESET env в workflow (.github/workflows/deploy*.yml).
    preset:
      (process.env.NITRO_PRESET as 'vercel' | 'node-server') ?? 'node-server',
  },
  runtimeConfig: runtimeConfig,
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/fonts.css', '~/assets/css/main.css'],
  modules: modulesConfig,
  vite: viteConfig,
  app: appConfig,
  icon: iconConfig,
  features: {
    inlineStyles: false,
  },
  routeRules: {
    '/profile/**': { ssr: false },
    '/admin/dashboard': { ssr: false },
  },
  devServer: {
    host: '127.0.0.1',
  },
  hooks: {
    'pages:extend'(routes) {
      // Файл страницы payment-result.vue переименован из payment-success.vue,
      // но URL сохранён для backward compat (return_url ЮKassa, ссылки из
      // success.vue и т.п.). Когда решим сменить URL — удалим этот hook и
      // обновим все ссылки в коде отдельным PR.
      const renamed = routes.find(r => r.path === '/shop/payment-result')
      if (renamed) renamed.path = '/shop/payment-success'
    },
  },
})
