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
    preset: 'node-server',
  },
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
  devServer: {
    host: '127.0.0.1',
  },
  // Раньше здесь был hook 'nitro:config' который пререндерил выставки
  // на этапе build через fetch Firebase. Это вызывало:
  //   - 'Unexpected token < <!DOCTYPE is not valid JSON' если Firebase
  //     возвращал HTML (auth/404/network)
  //   - Устаревшие данные после каждого обновления в Firebase
  // С node-server + ssr:false пререндер не нужен — Vue/SSR=false
  // загружает данные динамически через vuefire на клиенте.
})
