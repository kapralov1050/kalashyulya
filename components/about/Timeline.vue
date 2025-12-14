<template>
  <div class="container relative">
    <svg
      width="1080"
      height="3030"
      viewBox="15 0 1050 3030"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="absolute top-10 left-1/2 transform -translate-x-1/2 z-[-1]
        will-change-[stroke-dashoffset] translate-y-18 sm:translate-y-10
        scale-y-106 lg:scale-y-100 sm:hidden scale-x-35 lg:block lg:scale-x-100"
    >
      <path
        id="scrollPath"
        d="M494.874 2.44315C494.874 2.44315 -444.907 201.943 354.874 331.741C500.208 355.328 1040.15 363.563 1051.59 541.531C1060.87 685.943 16.6203 982.943 16.6203 848.68C16.6203 702.527 1089.16 951.713 1004.45 1115C953.374 1213.44 90.3735 1258.94 16.6203 1347.94C-132.833 1528.29 953.374 1914.94 953.374 1702.94C953.374 1532.5 29.6304 1760.57 39.8735 1945.44C48.96 2109.45 818.873 2138.44 867.373 2252.44C973.874 2411.94 746.374 2401.94 462.374 2536.44C178.374 2670.94 49.8735 2669.59 49.8735 2845.44C49.8735 3044.44 606.374 3026.44 606.374 3026.44"
        stroke="#7FC4F8"
        class="stroke-[#7FC4F8] stroke-2 sm:stroke-3 md:stroke-[5]
          lg:stroke-[7]"
      />
      <g class="timeline-icon">
        <circle cx="500" cy="0" r="10" fill="url(#timelineGrad)" />
        <circle cx="500" cy="0" r="6" fill="white" />
      </g>
      <g class="particles" style="opacity: 0"></g>
      <defs>
        <linearGradient id="timelineGrad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#7FC4F8" />
          <stop offset="1" stop-color="#4A90E2" />
        </linearGradient>
      </defs>
    </svg>
    <div class="container flex flex-col gap-y-25 items-center">
      <TimelineItem v-for="item in timelineText" :key="item.id" :item="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted } from 'vue'
  import { useTimelineAnimation } from '~/composables/useTimelineAnimation'
  import { timelineBlock } from '~/data/timeline'
  import {
    cleanupScrollAnimation,
    setupScrollAnimation,
  } from '~/helpers/scrollAnimation'
  import TimelineItem from './TimelineItem.vue'

  const { animate } = useTimelineAnimation()
  const { timelineText } = timelineBlock()

  onMounted(() => {
    setupScrollAnimation('#scrollPath')
    animate()
  })

  onBeforeUnmount(() => {
    cleanupScrollAnimation('#scrollPath')
  })
</script>
