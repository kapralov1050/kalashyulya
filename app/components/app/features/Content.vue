<template>
  <div class="container grid gap-4 lg:grid-cols-3 lg:gap-8">
    <AppFeaturesCard
      v-for="feature in features"
      :key="feature.title"
      :feature="feature"
      :link="feature.link"
    />
  </div>
</template>

<script setup lang="ts">
  const { playlists } = usePlaylistsStore()
  const { getLessonById } = useLessonsStore()

  const features = [
    'material-symbols:landscape-2-outline',
    'material-symbols:psychiatry-outline-rounded',
    'material-symbols:face-outline',
    'material-symbols:stairs-2',
    'material-symbols:palette-outline',
    'material-symbols:nature-people-outline',
  ].map((icon, i) => {
    const playlist = playlists[i]
    if (!playlist) throw createError({ statusCode: 404, message: 'Playlist not found' })

    const firstLessonId = playlist.lessonIds[0]
    if (firstLessonId === undefined) throw createError({ statusCode: 404, message: 'Lesson not found' })

    const lesson = getLessonById(firstLessonId)
    if (!lesson) throw createError({ statusCode: 404, message: 'Lesson not found' })

    return {
      title: playlist.title,
      description: playlist.description,
      link: `/playlists/${slugify(playlist.title)}/lessons/${slugify(lesson.title)}`,
      icon,
    }
  })
</script>

<style scoped lang="scss"></style>
