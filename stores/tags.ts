import { defineStore } from 'pinia'
import { useFirebase } from '~/composables/firebase/useFirebase'

export const useTagsStore = defineStore('tags', () => {
  const { lessonsTagsData } = useFirebase()

  const tags = computed(() =>
    Object.entries(lessonsTagsData.value || {}).map(tag => {
      return {
        id: tag[0],
        title: tag[1],
      }
    }),
  )

  function getTagsById(ids: number[]) {
    return tags.value.filter(tag => ids.includes(+tag.id))
  }

  return {
    tags,
    getTagsById,
  }
})
