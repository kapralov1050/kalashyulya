import { vueFireConfig } from './config/nuxt/vueFire'
import { googleFontsConfig } from './config/nuxt/googleFonts'
import { iconConfig } from './config/nuxt/icon'
import { i18nConfig } from './config/nuxt/i18n'
import { runtimeConfig } from './config/nuxt/runtimeConfig'
import { modulesConfig } from './config/nuxt/modules'
import { viteConfig } from './config/nuxt/vite'
import { appConfig } from './config/nuxt/app'

export default defineNuxtConfig({
  ssr: false,
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
  i18n: i18nConfig,
})
