import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom', // или 'nuxt' если используете @nuxt/test-utils
    globals: true,
  },
})
