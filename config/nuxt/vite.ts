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
    },
    chunkSizeWarningLimit: 1000,
    modulePreload: false,
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'gsap'],
    // Можно оставить exclude для firebase или убрать - VueFire разберется
    exclude: ['firebase'],
  },
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
  server: {
    fs: {
      strict: false,
    },
  },
}
