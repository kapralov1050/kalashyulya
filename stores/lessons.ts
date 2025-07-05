import { defineStore } from 'pinia'
interface Lesson {
  id: number
  title: string
  description: string
  duration: number
}

export const useLessonsStore = defineStore('lessons', () => {
  const lessons = ref<Lesson[]>([
    {
      id: 1,
      title: 'First',
      description: 'Lorem1',
      duration: 55,
    },
    {
      id: 2,
      title: 'Second',
      description: 'Lorem2',
      duration: 55,
    },
    {
      id: 3,
      title: 'Third',
      description: 'Lorem3',
      duration: 55,
    },
    {
      id: 4,
      title: 'Fourth',
      description: 'Lorem4',
      duration: 55,
    },
    {
      id: 5,
      title: 'Fifth',
      description: 'Lorem5',
      duration: 55,
    },
    {
      id: 6,
      title: 'Six',
      description: 'Lorem6',
      duration: 55,
    },
  ])

  function getLessonById(id: number) {
    return lessons.value.find(lesson => lesson.id === id)
  }

  return {
    lessons,
    getLessonById,
  }
})
