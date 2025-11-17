import { ref } from 'vue'
import type { TimelineItem } from '~/types/index'

export const timelineBlock = () => {
  const { printLocale } = useLocales()

  const createTimelineItem = (
    id: number,
    year: string,
    text: string,
    Image: string,
  ): TimelineItem => ({
    id,
    year,
    text,
    Image,
  })

  const timelineText = ref<TimelineItem[]>([])

  for (let i = 1; i <= 7; i++) {
    timelineText.value.push(
      createTimelineItem(
        i,
        printLocale(`about_timeline_year${i}`),
        printLocale(`about_timeline_${i}`),
        `/timeline/${i}.webp`,
      ),
    )
  }

  return {
    timelineText,
  }
}
