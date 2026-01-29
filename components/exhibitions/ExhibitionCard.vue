<template>
  <NuxtLink :to="`/exhibitions/${exhibition.slug}`" class="block h-full">
    <article
      class="group relative flex h-full flex-col overflow-hidden rounded-2xl
        border border-neutral-200 bg-white shadow-sm transition
        hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800
        dark:bg-neutral-900"
    >
      <div class="relative aspect-[4/3] w-full overflow-hidden">
        <img
          :src="exhibition.coverImage"
          :alt="exhibition.title"
          class="h-full w-full object-cover transition-transform duration-500
            group-hover:scale-105"
        />

        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-t
            from-black/55 via-black/15 to-transparent"
        />

        <!-- Статус -->
        <div
          class="absolute bottom-4 right-4 inline-flex items-center gap-1
            rounded-full px-3 py-1 text-xs font-semibold text-white"
          :class="statusBadgeClasses"
        >
          <span class="inline-block size-1.5 rounded-full bg-white/90" />
          <span>{{ statusLabel }}</span>
        </div>
      </div>

      <div class="flex flex-1 flex-col gap-2 px-5 py-4">
        <h3
          class="line-clamp-2 text-base font-semibold text-neutral-900
            dark:text-white"
          v-html="printLocale(exhibition?.title || '', { breakLn: true })"
        />
        <p
          class="text-xs font-medium uppercase tracking-wide text-neutral-500
            dark:text-neutral-400"
        >
          {{ exhibition.dateRange }}
        </p>
        <p
          class="mt-1 line-clamp-3 text-sm text-neutral-600
            dark:text-neutral-300"
        >
          {{ exhibition.shortDescription }}
        </p>
      </div>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
  import type { Exhibition } from '~/types'

  const props = defineProps<{
    exhibition: Exhibition
  }>()

  const { getStatusLabel } = useExhibitionsStore()
  const { printLocale } = useLocales()

  const statusLabel = computed(() => getStatusLabel(props.exhibition.status))

  const statusBadgeClasses = computed(() => {
    switch (props.exhibition.status) {
      case 'planned':
        return 'bg-blue-600/90 dark:bg-blue-500/90'
      case 'ongoing':
        return 'bg-emerald-600/90 dark:bg-emerald-500/90'
      case 'finished':
        return 'bg-amber-500/95 dark:bg-amber-400/95'
      default:
        return 'bg-neutral-600/90'
    }
  })
</script>
