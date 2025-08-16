import type { NuxtConfig } from 'nuxt/config'

export const appConfig: NuxtConfig['app'] = {
  head: {
    title: 'Юлия Калашникова | Акварельная живопись',
    titleTemplate: '%s | Юлия Калашникова',
    meta: [
      {
        name: 'description',
        content:
          'Юлия Калашникова - художник-акварелист. Уроки акварельной живописи, мастер-классы, картины и открытки. Изучайте искусство акварели вместе со мной!',
      },
      {
        name: 'keywords',
        content:
          'акварель, художник, Юлия Калашникова, живопись, уроки, мастер-классы, пейзажи, картины',
      },
      { name: 'author', content: 'Юлия Калашникова' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/PaintBrush.svg',
      },
    ],
  },
}
