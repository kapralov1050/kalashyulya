<template>
  <section class="flex flex-col pt-24 pb-12 sm:py-16 md:gap-y-12">
    <AppSectionHeader
      type="page"
      :heading="playlist?.title"
      :subheading="playlist?.description"
    />
    <div class="container grid grid-cols-1 gap-y-8 lg:grid-cols-3 lg:gap-x-8">
      <PlaylistLessons />
      <NuxtPage />
    </div>
  </section>
</template>

<script setup lang="ts">
  const playlist = usePlaylistsStore().getPlaylistBySlug(
    useRoute().params.playlistSlug,
  )
</script>

<style scoped lang="scss"></style>
