import type { NuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'

export const viteConfig: NuxtConfig['vite'] = {
  plugins: [tailwindcss()],
}
