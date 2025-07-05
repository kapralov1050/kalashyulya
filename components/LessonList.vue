<template>
  <ul class="flex flex-col gap-y-1">
    <LessonListItem
      v-for="lesson in lessons"
      :key="lesson.number"
      :lesson="lesson"
    />
  </ul>
</template>

<script setup lang="ts">
  const lessons = [
    {
      number: 1,
      title: 'Первый урок Юлии Калашниковой',
      duration: '5:30',
    },
    {
      number: 2,
      title: 'Второй урок Юлии Калашниковой',
      duration: '11:30',
    },
  ]
</script>

<style scoped lang="scss"></style>
