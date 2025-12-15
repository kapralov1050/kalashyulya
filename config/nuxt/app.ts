import type { NuxtConfig } from 'nuxt/config'

const defaultTitle = 'Юлия Калашникова | Акварельная живопись'
const defaultDescription =
  'Юлия Калашникова - художник-акварелист. Уроки акварельной живописи, мастер-классы, картины и открытки. Изучайте искусство акварели вместе со мной!'
const defaultImage = 'https://kalashyulya.ru/logo.png'
const siteName = 'Юлия Калашникова'

export const appConfig: NuxtConfig['app'] = {
  head: {
    htmlAttrs: {
      lang: 'ru',
    },
    title: defaultTitle,
    titleTemplate: '%s | Юлия Калашникова',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'description',
        content: defaultDescription,
      },
      {
        name: 'keywords',
        content:
          'акварель, художник, Юлия Калашникова, живопись, уроки, мастер-классы, пейзажи, картины',
      },
      { name: 'author', content: 'Юлия Калашникова' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, maximum-scale=5',
      },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'theme-color', content: '#ffffff' },
      { name: 'msapplication-TileColor', content: '#ffffff' },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: siteName },
      { property: 'og:title', content: defaultTitle },
      { property: 'og:description', content: defaultDescription },
      { property: 'og:image', content: defaultImage },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:locale', content: 'ru_RU' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: defaultTitle },
      { name: 'twitter:description', content: defaultDescription },
      { name: 'twitter:image', content: defaultImage },
      // Mobile
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: siteName },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  },
}
