<template>
  <UDropdownMenu
    arrow
    :items="items"
    :ui="{
      content: 'w-100',
    }"
    class="md:hidden"
  >
    <UButton icon="i-lucide-menu" color="neutral" variant="ghost" />
  </UDropdownMenu>
</template>

<script setup lang="ts">
  import type { DropdownMenuItem } from '@nuxt/ui'

  const items = ref<DropdownMenuItem[]>([
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
        to: '/playlists',
      },
    ],
    [
      {
        label: 'Войти',
        icon: 'heroicons:arrow-left-on-rectangle',
      },
      {
        label: 'Регистрация',
        icon: 'heroicons:user-plus',
      },
    ],
  ])
</script>

<style scoped lang="scss"></style>
