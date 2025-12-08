import type { NuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'

export const viteConfig: NuxtConfig['vite'] = {
  plugins: [tailwindcss()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'gsap'],
  },
}
