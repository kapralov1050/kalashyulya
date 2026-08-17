import { appConfig } from './config/nuxt/app'
import { iconConfig } from './config/nuxt/icon'
import { modulesConfig } from './config/nuxt/modules'
import { runtimeConfig } from './config/nuxt/runtimeConfig'
import { viteConfig } from './config/nuxt/vite'

export default defineNuxtConfig({
  ssr: false,
  nitro: {
    preset: 'node-server',
    scanDirs: ['server'],
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
})
