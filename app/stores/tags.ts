import { defineStore } from 'pinia'

export interface LessonTag {
  id: string
  title: string
}

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<LessonTag[]>([])

  async function loadTags() {
    tags.value = await $fetch<LessonTag[]>('/api/lessons-tags').catch(() => [])
  }

  function getTagsById(ids: Array<string | number>) {
    return tags.value.filter(tag => ids.map(String).includes(String(tag.id)))
  }

  return { tags, loadTags, getTagsById }
})