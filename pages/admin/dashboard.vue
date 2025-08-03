<template>
  <article class="container">
    <h1>Панель администратора</h1>
    <select v-model="selectedModal">
      <option
        v-for="option in Object.keys(dashboardModals)"
        :key="option"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
    <component :is="dashboardModals[selectedModal]" />

    <button @click="quitFromAdminPanel">Выйти</button>
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
  }

  const { logOut } = useFirebase()
  const router = useRouter()

  const quitFromAdminPanel = () => {
    logOut()
    router.push('/')
  }
</script>

<style scoped lang="scss"></style>
