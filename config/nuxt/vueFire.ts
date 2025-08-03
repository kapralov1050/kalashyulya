import type { NuxtConfig } from 'nuxt/schema'

export const vueFireConfig: NuxtConfig['vuefire'] = {
  config: {
    apiKey: 'AIzaSyCd6RtL-I9Az59wKV_aWbhOk7PKX03Rt-c',
    authDomain: 'kalashyulya-lessons.firebaseapp.com',
    databaseURL:
      'https://kalashyulya-lessons-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'kalashyulya-lessons',
    storageBucket: 'kalashyulya-lessons.firebasestorage.app',
    messagingSenderId: '30642592130',
    appId: '1:30642592130:web:4fc2962c7af0e90c26179b',
    measurementId: 'G-8RTY5DXRHG',
  },
  services: {
    database: true,
    auth: true,
  },
}
