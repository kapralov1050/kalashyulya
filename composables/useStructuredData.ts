export interface OrganizationData {
  name: string
  url: string
  logo?: string
  sameAs?: string[]
}

export interface ProductData {
  name: string
  description: string
  image: string | string[]
  price: number
  currency?: string
  availability?: string
  url: string
}

export interface VideoData {
  name: string
  description: string
  thumbnailUrl: string | string[]
  uploadDate: string
  duration?: string
  url: string
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function useStructuredData() {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://kalashyulya.ru'

  function generateOrganization(data: OrganizationData) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: data.name,
      url: data.url,
      ...(data.logo && {
        image: data.logo,
      }),
      ...(data.sameAs && {
        sameAs: data.sameAs,
      }),
    }
  }

  function generateProduct(data: ProductData) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.name,
      description: data.description,
      image: Array.isArray(data.image) ? data.image : [data.image],
      offers: {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: data.currency || 'RUB',
        availability:
          data.availability || 'https://schema.org/InStock',
        url: data.url,
      },
    }
  }

  function generateVideo(data: VideoData) {
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: data.name,
      description: data.description,
      thumbnailUrl: Array.isArray(data.thumbnailUrl)
        ? data.thumbnailUrl
        : [data.thumbnailUrl],
      uploadDate: data.uploadDate,
      ...(data.duration && {
        duration: data.duration,
      }),
      contentUrl: data.url,
    }
  }

  function generateBreadcrumb(items: BreadcrumbItem[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url.startsWith('http')
          ? item.url
          : `${siteUrl}${item.url}`,
      })),
    }
  }

  function generateWebsite() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Юлия Калашникова',
      url: siteUrl,
      description:
        'Юлия Калашникова - художник-акварелист. Уроки акварельной живописи, мастер-классы, картины и открытки.',
    }
  }

  function addStructuredData(data: object | object[]) {
    const scripts = Array.isArray(data) ? data : [data]

    useHead({
      script: scripts.map(item => ({
        type: 'application/ld+json',
        children: JSON.stringify(item),
      })),
    })
  }

  return {
    generateOrganization,
    generateProduct,
    generateVideo,
    generateBreadcrumb,
    generateWebsite,
    addStructuredData,
  }
}

