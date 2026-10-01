import { toSentenceCase } from '~/utils/sentenceCase'

interface MainNavItem {
  to: string
  label: string
  prefetch: boolean
  ariaCurrent?: 'page' | 'true'
}

export function useMainNav() {
  const route = useRoute()
  const { printLocale } = useLocales()

  const links = [
    { to: '/', key: 'header_about', prefetch: true },
    { to: '/calendar', key: 'header_calendar', prefetch: false },
    { to: '/exhibitions', key: 'header_exhibition', prefetch: false },
    { to: '/shop', key: 'header_shop', prefetch: false },
  ]

  const getAriaCurrent = (to: string): MainNavItem['ariaCurrent'] => {
    if (route.path === to) return 'page'
    if (to !== '/' && route.path.startsWith(`${to}/`)) return 'true'
    return undefined
  }

  const items = computed<MainNavItem[]>(() =>
    links.map(({ to, key, prefetch }) => ({
      to,
      prefetch,
      label: toSentenceCase(printLocale(key)),
      ariaCurrent: getAriaCurrent(to),
    })),
  )

  return { items }
}
