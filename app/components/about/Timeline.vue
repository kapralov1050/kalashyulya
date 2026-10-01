<template>
  <section aria-label="Биография">
    <div ref="root" class="container relative">
      <svg
        ref="svg"
        fill="none"
        aria-hidden="true"
        class="pointer-events-none absolute left-0 top-0 z-[-1]
          overflow-visible"
      >
        <path
          ref="path"
          class="stroke-neutral-300 stroke-[1.5] sm:stroke-2 lg:stroke-[2.5]
            dark:stroke-neutral-700"
        />
        <g ref="icon">
          <circle r="5" class="fill-neutral-900 dark:fill-white" />
          <circle r="2.5" class="fill-white dark:fill-neutral-900" />
        </g>
      </svg>
      <ol ref="list" class="flex flex-col items-center gap-y-14 sm:gap-y-16">
        <TimelineItem
          v-for="item in timelineText"
          :key="item.id"
          :item="item"
        />
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
  import { timelineBlock } from '~/data/timeline'
  import { setupTimelineLine } from '~/helpers/scrollAnimation'
  import TimelineItem from './TimelineItem.vue'

  const { timelineText } = timelineBlock()

  const root = useTemplateRef<HTMLElement>('root')
  const svg = useTemplateRef<SVGSVGElement>('svg')
  const path = useTemplateRef<SVGPathElement>('path')
  const icon = useTemplateRef<SVGGElement>('icon')
  const list = useTemplateRef<HTMLElement>('list')

  const anchors = () => {
    const images = list.value?.querySelectorAll('img')
    if (!images || images.length < 2) return null
    return [images[0]!, images[images.length - 1]!] as const
  }

  const stations = () => [
    ...(list.value?.querySelectorAll<HTMLElement>('[data-timeline-year]') ??
      []),
  ]

  let cleanup: (() => void) | undefined

  onMounted(() => {
    if (!root.value || !svg.value || !path.value || !icon.value) return
    cleanup = setupTimelineLine({
      root: root.value,
      svg: svg.value,
      path: path.value,
      icon: icon.value,
      anchors,
      stations,
    })
  })

  onBeforeUnmount(() => cleanup?.())
</script>
