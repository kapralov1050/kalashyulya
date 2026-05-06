import type { NuxtConfig } from 'nuxt/schema'

export const iconConfig: NuxtConfig['icon'] = {
  mode: 'svg',
  clientBundle: {
    scan: true,
  },
}
