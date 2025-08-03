import type { NuxtConfig } from 'nuxt/config'

export const i18nConfig: NuxtConfig['i18n'] = {
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
}
