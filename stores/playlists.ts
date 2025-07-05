import { defineStore } from 'pinia'
interface Playlist {
  title: string
  id: number
  description: string
  tagIds: number[]
  lessonIds: number[]
}

export const usePlaylistsStore = defineStore('playlists', () => {
  const { t } = useI18n()

  const playlists = ref([
    {
      title: t('playlists.landscapes.title'),
      description: t('playlists.landscapes.description'),
      id: 1,
      tagIds: [1, 2, 3, 4],
      lessonIds: [3, 2, 3],
    },
    {
      title: t('playlists.flowers.title'),
      description: t('playlists.flowers.description'),
      id: 2,
      tagIds: [1, 2],
      lessonIds: [5, 2, 3],
    },
    {
      title: t('playlists.portraits.title'),
      description: t('playlists.portraits.description'),
      id: 3,
      tagIds: [1, 4],
      lessonIds: [1, 4, 3],
    },
    {
      title: t('playlists.basics.title'),
      description: t('playlists.basics.description'),
      id: 4,
      tagIds: [2, 3, 5],
      lessonIds: [1, 4, 3],
    },
    {
      title: t('playlists.color.title'),
      description: t('playlists.color.description'),
      id: 5,
      tagIds: [2],
      lessonIds: [1, 4, 3],
    },
    {
      title: t('playlists.composition.title'),
      description: t('playlists.composition.description'),
      id: 6,
      tagIds: [3],
      lessonIds: [1, 4, 3],
    },
  ])

  function getPlaylistBySlug(slug: string | string[]) {
    return playlists.value.find(
      playlist => playlist.title.toLowerCase().replaceAll(' ', '-') === slug,
    )
  }

  return {
    playlists,
    getPlaylistBySlug,
  }
})
