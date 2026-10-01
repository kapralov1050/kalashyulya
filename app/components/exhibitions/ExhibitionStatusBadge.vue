<template>
  <span
    class="inline-flex items-center rounded-full px-3 py-1 text-xs
      font-semibold sm:text-sm"
    :class="toneClasses"
  >
    {{ getStatusLabel(status) }}
  </span>
</template>

<script setup lang="ts">
  import type { ExhibitionStatus } from '~/types'

  const props = withDefaults(
    defineProps<{
      status: ExhibitionStatus
      surface?: 'image' | 'plain'
    }>(),
    { surface: 'plain' },
  )

  const { getStatusLabel } = useExhibitionsStore()

  const toneClasses = computed(() => {
    const isCurrent = props.status === 'ongoing'

    if (props.surface === 'image') {
      return isCurrent
        ? 'bg-white text-neutral-900'
        : 'bg-black/25 text-white ring-1 ring-inset ring-white/70'
    }

    return isCurrent
      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
      : `text-neutral-700 ring-1 ring-inset ring-neutral-300
        dark:text-neutral-200 dark:ring-neutral-600`
  })
</script>
