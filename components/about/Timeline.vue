<template>
  <div class="container relative">
    <svg
      width="1080"
      height="2596"
      viewBox="15 0 1050 2596"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="absolute top-10 left-1/2 transform -translate-x-1/2 z-[-1]
        will-change-[stroke-dashoffset] scale-x-50 lg:scale-x-100 lg:block"
    >
      <path
        id="scrollPath"
        d="M537.781 0C537.781 0 537.781 183.41 537.781 337.298C537.781 484.534 1017.23 370.584 1042.72 547.088C1062.49 684.017 -56.6296 976.133 7.74682 854.237C76 725 1040.88 942.271 995.572 1120.56C967.72 1230.15 40.727 1256.65 7.74682 1353.5C-67.7532 1575.22 831.625 1920.85 944.5 1708.5C1024.5 1558 20.7569 1766.12 31 1951C40.0865 2115 535.873 2014.51 537.781 2179.5V2596"
        stroke="#7FC4F8"
        stroke-width="5"
      />
    </svg>
    <div class="container flex flex-col gap-y-25 items-center">
      <TimelineItem v-for="item in timelineText" :key="item.id" :item="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted } from 'vue'
  import { useTimelineAnimation } from '~/composables/useTimelineAnimation'
  import { timelineText } from '~/data/timeline'
  import {
    cleanupScrollAnimation,
    setupScrollAnimation,
  } from '~/helpers/scrollAnimation'
  import TimelineItem from './TimelineItem.vue'

  const { animate } = useTimelineAnimation()

  onMounted(() => {
    setupScrollAnimation('#scrollPath')
    animate()
  })

  onBeforeUnmount(() => {
    cleanupScrollAnimation('#scrollPath')
  })
</script>
