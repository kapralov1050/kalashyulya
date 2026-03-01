import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    // Enable co-located tests in __tests__ directories
    include: ['**/__tests__/**/*.spec.ts'],
    // Ensure project files are excluded from test discovery
    exclude: ['node_modules', 'dist', '.nuxt', '.output'],
  },
})
