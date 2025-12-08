import tailwindcss from '@tailwindcss/vite'
import type { NuxtConfig } from 'nuxt/config'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export const viteConfig: NuxtConfig['vite'] = {
  plugins: [
    tailwindcss(),
    ViteImageOptimizer({
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      png: {
        quality: 80,
      },
      webp: {
        quality: 80,
        lossless: false,
        effort: 4,
      },
      avif: {
        quality: 70,
        lossless: false,
        effort: 9,
      },
      cache: true,
      cacheLocation: './node_modules/.cache/image-optimizer',
    }),
  ],
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
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          gsap: ['gsap'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'gsap'],
  },
}
