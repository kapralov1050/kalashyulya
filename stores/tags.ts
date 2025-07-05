import { defineStore } from 'pinia'
interface Tag {
  id: number
  name: string
}

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([
    { id: 1, name: 'Акварель' },
    { id: 2, name: 'Цвет' },
    { id: 3, name: 'Композиция' },
    { id: 4, name: 'Тематический рисунок' },
    { id: 5, name: 'Основы' },
  ])

  function getTagsById(ids: number[]) {
    return tags.value.filter(tag => ids.includes(tag.id))
  }

  return {
    tags,
    getTagsById,
  }
})
