<template>
  <div class="container relative">
    <svg
      width="1080"
      height="2596"
      viewBox="15 0 1050 2596"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="absolute top-10 left-1/2 transform -translate-x-1/2 z-[-1]
        will-change-[stroke-dashoffset] scale-y-105 translate-y-20
        sm:translate-y-0 sm:scale-y-100 scale-x-35 lg:scale-x-100"
    >
      <path
        id="scrollPath"
        d="M485.248 2.44315C485.248 2.44315 -454.533 201.943 345.248 331.741C490.583 355.328 1016.48 365.027 1041.97 541.531C1061.74 678.461 -57.3818 970.576 6.99462 848.68C75.2478 719.443 1040.13 936.714 994.82 1115C966.968 1224.6 39.9748 1251.09 6.99462 1347.94C-68.5054 1569.67 830.873 1915.29 943.748 1702.94C1023.75 1552.44 20.0047 1760.57 30.2478 1945.44C39.3343 2109.45 926.748 2152.94 952.248 2277.94C977.748 2402.94 574.248 2654.94 514.748 2610.44"
        stroke="#7FC4F8"
        class="stroke-[#7FC4F8] stroke-2 sm:stroke-3 md:stroke-[5]
          lg:stroke-[7]"
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
