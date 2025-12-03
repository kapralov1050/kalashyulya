<template>
  <div class="flex flex-col items-center lg:w-1/3 gap-y-4">
    <img
      :src="item.Image"
      class="size-42 object-cover rounded-2xl border-5 border-info-400 shadow-md
        dark:shadow-none"
    />
    <div class="flex flex-col items-center p-2 rounded-xl gap-y-2">
      <h3 class="font-bold text-lg">{{ item.year }}</h3>
      <p class="text-sm font-bold">{{ item.text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { TimelineItem } from '~/types/index'

  defineProps<{ item: TimelineItem }>()
</script>
