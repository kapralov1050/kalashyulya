import { defineStore } from 'pinia'

export const usePlaylistsStore = defineStore('playlists', () => {
  const { printLocale } = useLocales()

  const playlists = ref([
    {
      title: printLocale('playlists_landscapes_title'),
      description: printLocale('playlists_landscapes_description'),
      id: 1,
      tagIds: [1, 2, 3, 4],
      lessonIds: [3, 2, 3],
    },
    {
      title: printLocale('playlists_flowers_title'),
      description: printLocale('playlists_flowers_description'),
      id: 2,
      tagIds: [1, 2],
      lessonIds: [5, 2, 3],
    },
    {
      title: printLocale('playlists_portraits_title'),
      description: printLocale('playlists_portraits_description'),
      id: 3,
      tagIds: [1, 4],
      lessonIds: [1, 4, 3],
    },
    {
      title: printLocale('playlists_basics_title'),
      description: printLocale('playlists_basics_description'),
      id: 4,
      tagIds: [2, 3, 5],
      lessonIds: [1, 4, 3],
    },
    {
      title: printLocale('playlists_color_title'),
      description: printLocale('playlists_color_description'),
      id: 5,
      tagIds: [2],
      lessonIds: [1, 4, 3],
    },
    {
      title: printLocale('playlists_composition_title'),
      description: printLocale('playlists_composition_description'),
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
