import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [vue() as any],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app/', import.meta.url)),
      '@': fileURLToPath(new URL('./app/', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    // Enable co-located tests in __tests__ directories
    include: ['**/__tests__/**/*.{spec,test}.ts'],
    // Ensure project files are excluded from test discovery
    exclude: ['node_modules', 'dist', '.nuxt', '.output'],
    setupFiles: ['./vitest.setup.ts'],
    server: {
      deps: {
        inline: ['@nuxt/ui'],
      },
    },
  },
})
