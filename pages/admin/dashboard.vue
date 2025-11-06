<template>
  <article class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div
          class="flex flex-col lg:flex-row lg:items-center lg:justify-between
            gap-4"
        >
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Панель администратора
            </h1>
            <p class="text-gray-600 mt-1">Управление товарами и контентом</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <!-- Module Selector -->
            <div class="relative">
              <select
                v-model="selectedModal"
                class="appearance-none bg-white border border-gray-300
                  rounded-lg px-4 py-2.5 pr-10 text-gray-700 focus:outline-none
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  cursor-pointer shadow-sm w-full"
              >
                <option
                  v-for="option in Object.keys(dashboardModals)"
                  :key="option"
                  :value="option"
                  class="py-2"
                >
                  {{ getModalDisplayName(option) }}
                </option>
              </select>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex
                  items-center px-2 text-gray-700"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <!-- Logout Button -->
            <button
              class="flex items-center justify-center gap-2 px-4 py-2.5
                text-red-600 border border-red-300 rounded-lg hover:bg-red-50
                hover:border-red-400 transition-colors duration-200 font-medium"
              @click="quitFromAdminPanel"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Выйти
            </button>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <component :is="dashboardModals[selectedModal]" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
  import type { Component } from 'vue'
  import { useFirebase } from '~/composables/firebase/useFirebase'
  import type { DashBoardOption } from '~/types'

  definePageMeta({
    middleware: 'auth',
  })

  const selectedModal = ref<DashBoardOption>('NewProductForm')

  const dashboardModals: Record<DashBoardOption, Component> = {
    NewProductForm: defineAsyncComponent(
      () => import('@/components/dashboard/NewProductForm.vue'),
    ),
    ProductsList: defineAsyncComponent(
      () => import('@/components/dashboard/ProductsList.vue'),
    ),
    LocalesForm: defineAsyncComponent(
      () => import('@/components/dashboard/LocalesForm.vue'),
    ),
  }

  const getModalDisplayName = (option: string) => {
    const names: Record<string, string> = {
      NewProductForm: 'Добавить товар',
      ProductsList: 'Список товаров',
      LocalesForm: 'Изменить локали',
    }
    return names[option] || option
  }

  const { logOut } = useFirebase()
  const router = useRouter()

  const quitFromAdminPanel = async () => {
    try {
      await logOut()
      router.push('/')
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    }
  }
</script>

<style scoped>
  /* Custom scrollbar for select */
  select::-ms-expand {
    display: none;
  }

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
</style>
