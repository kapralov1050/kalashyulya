import type { NuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'

export const viteConfig: NuxtConfig['vite'] = {
  plugins: [tailwindcss()],
  // Оптимизации сборки
  build: {
    // Включаем сжатие для продакшена
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Удаляем console.log в продакшене
        drop_debugger: true // Удаляем debugger
      }
    },
    // Оптимизация чанков
    chunkSizeWarningLimit: 1000,
    // Кэширование модулей для ускорения повторных сборок
    modulePreload: false,
    // Оптимизация бандлов
    rollupOptions: {
      output: {
        manualChunks: {
          // Выносим библиотеки в отдельные чанки
          vendor: ['vue', 'vue-router', 'pinia', 'firebase', 'gsap'],
          ui: ['@nuxt/ui', '@nuxt/icon']
        }
      }
    }
  },
  // Оптимизации для разработки
  optimizeDeps: {
    // Предварительная компиляция зависимостей для ускорения разработки
    include: [
      'vue',
      'vue-router',
      'pinia',
      'firebase/app',
      'firebase/auth',
      'gsap'
    ]
  },
  // Оптимизация обработки изображений
  define: {
    // Глобальные константы для оптимизации размера бандла
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false
  },
  // Настройка сервера для разработки
  server: {
    // Оптимизация для локальной разработки
    fs: {
      // Разрешаем доступ к файлам выше корневой директории
      strict: false
    }
  }
}
