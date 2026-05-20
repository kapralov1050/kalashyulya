export interface SeoMeta {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  noindex?: boolean
}

export function useSeo(meta: SeoMeta = {}) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const siteUrl = config.public.siteUrl || 'https://kalashyulya.ru'

  const title = meta.title || 'Юлия Калашникова | Акварельная живопись'
  const description =
    meta.description ||
    'Юлия Калашникова - художник-акварелист. Уроки акварельной живописи, мастер-классы, картины и открытки. Изучайте искусство акварели вместе со мной!'
  const image = meta.image
    ? meta.image.startsWith('http')
      ? meta.image
      : `${siteUrl}${meta.image}`
    : `${siteUrl}/logo.png`
  const url = meta.url || `${siteUrl}${route.path}`
  const type = meta.type || 'website'

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: url,
    ogType: type,
    ogSiteName: 'Юлия Калашникова',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    robots: meta.noindex ? 'noindex, nofollow' : 'index, follow',
  })

  useHead({
    link: [
      {
        rel: 'canonical',
        href: url,
      },
    ],
  })
}
