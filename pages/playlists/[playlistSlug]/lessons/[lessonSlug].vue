<template>
  <div class="flex flex-col gap-y-6 md:gap-y-8 lg:col-span-2">
    <PlaylistLessonVideo />
    <PlaylistLessonContent />
  </div>
</template>

<script setup lang="ts">
  const route = useRoute()
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://kalashyulya.ru'

  // Получаем данные урока из компонента или store
  // Пока используем базовые метаданные
  const lessonTitle = 'Урок акварели'
  const lessonDescription = 'Урок акварельной живописи от Юлии Калашниковой'

  useSeo({
    title: lessonTitle,
    description: lessonDescription,
    image: '/logo.png',
    type: 'article',
  })

  // Структурированные данные для видео
  const { generateVideo, addStructuredData } = useStructuredData()
  const videoData = generateVideo({
    name: lessonTitle,
    description: lessonDescription,
    thumbnailUrl: `${siteUrl}/logo.png`,
    uploadDate: new Date().toISOString(),
    url: `${siteUrl}${route.path}`,
  })
  addStructuredData(videoData)
</script>

<style scoped lang="scss"></style>
