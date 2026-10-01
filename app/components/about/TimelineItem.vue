<template>
  <li class="flex w-full max-w-xl flex-col items-center text-center">
    <img
      :src="item.Image"
      alt=""
      loading="lazy"
      decoding="async"
      class="h-48 w-auto max-w-full bg-neutral-100 dark:bg-neutral-800 sm:h-60"
    />
    <h3
      data-timeline-year
      class="mt-5 text-xl font-semibold tabular-nums text-neutral-500
        transition-[color] duration-200 ease-[var(--ease-out-strong)]
        data-reached:text-neutral-900 dark:text-neutral-400
        dark:data-reached:text-white"
    >
      {{ item.year }}
    </h3>
    <p
      class="mt-2 text-base leading-[1.65] text-neutral-700
        dark:text-neutral-200"
    >
      {{ item.text }}
    </p>
  </li>
</template>

<script setup lang="ts">
  import type { TimelineItem } from '~/types/index'

  defineProps<{ item: TimelineItem }>()
</script>
