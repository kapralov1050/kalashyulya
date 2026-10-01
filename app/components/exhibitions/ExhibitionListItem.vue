<template>
  <article
    class="group relative flex flex-col rounded-sm
      has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4
      has-[a:focus-visible]:outline-neutral-900
      dark:has-[a:focus-visible]:outline-white"
  >
    <div class="flex aspect-[4/3] items-end">
      <img
        v-if="exhibition.coverImage"
        :src="exhibition.coverImage"
        alt=""
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
        decoding="async"
        style="aspect-ratio: auto 4 / 3"
        class="max-w-full bg-neutral-100
          shadow-[0_1px_2px_rgb(0_0_0/0.08),0_14px_28px_-18px_rgb(0_0_0/0.4)]
          max-h-full dark:bg-neutral-800 dark:shadow-none"
        :class="isWide ? 'h-auto w-full' : 'h-full w-auto'"
        @load="handleLoad"
      />
      <div
        v-else
        class="aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-800"
      />
    </div>

    <div class="mt-5 flex flex-col">
      <h2
        class="mt-3 text-balance text-2xl font-semibold leading-[1.2]
          tracking-[-0.01em] text-neutral-900 dark:text-white"
      >
        <NuxtLink
          :to="`/exhibitions/${exhibition.slug}`"
          class="underline decoration-transparent decoration-1
            underline-offset-[5px] transition-[text-decoration-color]
            duration-200 ease-[var(--ease-out-strong)] after:absolute
            after:inset-0 focus-visible:outline-none
            group-hover:decoration-neutral-400 motion-reduce:transition-none
            dark:group-hover:decoration-neutral-500"
        >
          {{ name }}
        </NuxtLink>
      </h2>

      <div class="order-first flex flex-wrap items-center gap-x-3 gap-y-2">
        <ExhibitionStatusBadge :status="exhibition.status" />
        <p
          class="text-[0.9375rem] font-medium tabular-nums text-neutral-600
            dark:text-neutral-300"
        >
          {{ dates }}
        </p>
      </div>

      <p
        v-if="venue || city"
        class="mt-2 text-[0.9375rem] leading-normal text-neutral-600
          dark:text-neutral-300"
      >
        {{ venue }}<template v-if="venue && city">, </template><span
          v-if="city"
          class="whitespace-nowrap"
        >{{ city }}</span>
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
  import ExhibitionStatusBadge from '~/components/exhibitions/ExhibitionStatusBadge.vue'
  import type { Exhibition } from '~/types'
  import {
    bindShortWords,
    formatExhibitionDates,
    getExhibitionName,
  } from '~/utils/exhibitionList'

  const props = defineProps<{
    exhibition: Exhibition
    priority?: boolean
  }>()

  const name = computed(() => getExhibitionName(props.exhibition.title))
  const dates = computed(() => formatExhibitionDates(props.exhibition.dateRange))
  const venue = computed(() =>
    bindShortWords(props.exhibition.location.venue?.trim() ?? ''),
  )
  const city = computed(() => props.exhibition.location.city?.trim())

  const coverRatio = ref<number | null>(null)
  const isWide = computed(
    () => coverRatio.value === null || coverRatio.value >= 4 / 3,
  )

  const handleLoad = (event: Event) => {
    const { naturalWidth, naturalHeight } = event.target as HTMLImageElement
    if (naturalWidth && naturalHeight) {
      coverRatio.value = naturalWidth / naturalHeight
    }
  }
</script>
