<template>
  <div class="flex flex-col gap-y-8 sm:flex-row sm:gap-x-16">
    <AppFooterList v-for="list in lists" :key="list.heading" :list="list" />
  </div>
</template>

<script setup lang="ts">
  const lists = [
    {
      heading: 'Popular Playlists',
      items: [
        {
          label: 'Prettier',
          link: '/playlists/first/lessons/index',
        },
        {
          label: 'GitLens',
          link: '/playlists/second/lessons/index',
        },
      ],
    },
    {
      heading: 'Popular Playlists',
      items: [
        {
          label: 'Prettier',
          link: '/playlists/first/lessons/index',
        },
        {
          label: 'GitLens',
          link: '/playlists/second/lessons/index',
        },
      ],
    },
  ]
</script>

<style scoped lang="scss"></style>
