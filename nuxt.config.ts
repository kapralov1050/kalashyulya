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
  devServer: {
    host: '127.0.0.1',
  },
  hooks: {
    'nitro:config': async nitroConfig => {
      try {
        const projectId = process.env.FIREBASE_PROJECT_ID
        const data = await fetch(
          `https://${projectId}-default-rtdb.europe-west1.firebasedatabase.app/exhibitions.json`,
        )

        if (data.ok) {
          const json = await data.json()
          const routes = Object.values(
            json as Record<string, { slug: string }>,
          ).map(exhibition => `/exhibitions/${exhibition.slug}`)
          nitroConfig.prerender ??= {}
          nitroConfig.prerender.routes = routes
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Не удалось загрузить выставки для пререндера:', error)
      }
    },
  },
})
