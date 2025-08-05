<template>
  <USlideover
    title="Меню"
    :close="{
      color: 'primary',
      variant: 'link',
      class: 'rounded-full',
    }"
    class="block lg:hidden"
  >
    <UButton icon="heroicons:bars-3-20-solid" color="neutral" variant="link" />

    <template #content>
      <UNavigationMenu
        orientation="vertical"
        :items="items"
        class="w-full justify-center"
      />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui'

  const items = ref<NavigationMenuItem[]>([
    [
      {
        label: 'Главная',
        icon: 'i-lucide-user',
        to: '/',
      },
      {
        label: 'Магазин',
        icon: 'heroicons:shopping-bag',
        to: '/shop',
      },
      {
        label: 'Уроки',
        icon: 'heroicons:paint-brush',
        to: '/lessons',
      },
    ],
    [
      {
        label: 'Войти',
        icon: 'heroicons:arrow-left-on-rectangle',
        to: '/login',
      },
      {
        label: 'Регистрация',
        icon: 'heroicons:user-plus',
        to: '/register',
      },
    ],
  ])
</script>

<style scoped lang="scss"></style>
