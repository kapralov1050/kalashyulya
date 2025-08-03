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
    const lesson = getLessonById(playlists[i].lessonIds[0])

    if (!lesson) {
      throw createError({ statusCode: 404, message: 'Lesson not found' })
    }

    return {
      title: playlists[i].title,
      description: playlists[i].description,
      link: `/playlists/${slugify(playlists[i].title)}/lessons/${slugify(lesson.title)}`,
      icon,
    }
  })
</script>

<style scoped lang="scss"></style>
