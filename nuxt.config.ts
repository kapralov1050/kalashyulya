import { appConfig } from './config/nuxt/app'
import { googleFontsConfig } from './config/nuxt/googleFonts'
import { iconConfig } from './config/nuxt/icon'
import { modulesConfig } from './config/nuxt/modules'
import { runtimeConfig } from './config/nuxt/runtimeConfig'
import { viteConfig } from './config/nuxt/vite'
import { vueFireConfig } from './config/nuxt/vueFire'

export default defineNuxtConfig({
  ssr: false,
  nitro: {
    preset: 'static',
    prerender: {
      routes: ['/exhibitions/**'],
    },
  },
  test: true,
  runtimeConfig: runtimeConfig,
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: modulesConfig,
  vuefire: vueFireConfig,
  vite: viteConfig,
  app: appConfig,
  googleFonts: googleFontsConfig,
  icon: iconConfig,
  features: {
    inlineStyles: false,
  },
  routeRules: {
    '/profile/**': { ssr: false },
    '/admin/dashboard': { ssr: false },
  },
})
