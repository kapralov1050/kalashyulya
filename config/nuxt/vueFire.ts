import type { NuxtConfig } from 'nuxt/schema'

export const vueFireConfig: NuxtConfig['vuefire'] = {
  config: {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    databaseURL: process.env.FIREBASE_DATABASE_URL || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
  },
  services: {
    database: true,
    auth: true,
    // Добавляем только необходимые сервисы для уменьшения размера бандла
    firestore: false,
    storage: false,
    functions: false,
    performance: false,
    analytics: false,
    remoteConfig: false,
    appCheck: false,
  },
  // Оптимизация производительности
  // Отключаем ненужные функции для уменьшения размера бандла
  emulatorHost: {
    firestore: undefined,
    auth: undefined,
    database: undefined,
    pubsub: undefined,
    storage: undefined,
    functions: undefined,
    hosting: undefined,
  },
}
