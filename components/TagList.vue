<template>
  <ul class="flex flex-col gap-y-1">
    <TaglistItem v-for="tag in tags" :key="tag.id">{{ tag.name }}</TaglistItem>
  </ul>
</template>

<script setup lang="ts">
  const { tags } = useTagsStore()
</script>

<style scoped lang="scss"></style>
