<template>
  <dl class="grid gap-7 text-[0.9375rem]">
    <div>
      <dt class="text-sm text-neutral-500 dark:text-neutral-400">Место</dt>
      <dd class="mt-1.5">
        <p class="font-medium text-neutral-900 dark:text-white">
          {{ exhibition.location.venue }}
        </p>
        <p class="mt-0.5 text-neutral-700 dark:text-neutral-200">
          {{ address }}
        </p>
        <p
          v-if="isVisitable && exhibition.location.metro?.length"
          class="mt-0.5 text-neutral-700 dark:text-neutral-200"
        >
          Станция метро: {{ exhibition.location.metro.join(', ') }}
        </p>
        <UButton
          v-if="isVisitable"
          variant="link"
          color="neutral"
          icon="i-heroicons-map-pin"
          class="-ml-0.5 mt-2 px-0 text-[0.9375rem] font-medium
            text-neutral-900 underline decoration-neutral-300
            underline-offset-4 hover:decoration-neutral-900 dark:text-white
            dark:decoration-neutral-600 dark:hover:decoration-white"
          @click="emit('open-map')"
        >
          Посмотреть на карте
        </UButton>
      </dd>
    </div>

    <div v-if="isVisitable && entry">
      <dt class="text-sm text-neutral-500 dark:text-neutral-400">Вход</dt>
      <dd class="mt-1.5 text-neutral-900 dark:text-white">{{ entry }}</dd>
    </div>

    <div v-if="isVisitable && exhibition.schedule.length">
      <dt class="text-sm text-neutral-500 dark:text-neutral-400">
        Часы работы
      </dt>
      <dd class="mt-1.5">
        <ul
          class="max-w-sm divide-y divide-neutral-200 dark:divide-neutral-800"
        >
          <li
            v-for="day in exhibition.schedule"
            :key="day.id"
            class="flex items-baseline justify-between gap-4 py-2"
          >
            <span class="text-neutral-700 dark:text-neutral-200">
              {{ day.label }}
            </span>
            <span
              class="tabular-nums"
              :class="
                day.isClosed
                  ? 'text-neutral-500 dark:text-neutral-400'
                  : 'text-neutral-900 dark:text-white'
              "
            >
              {{ day.time }}
            </span>
          </li>
        </ul>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
  import type { Exhibition } from '~/types'

  const props = defineProps<{
    exhibition: Exhibition
  }>()

  const emit = defineEmits<{
    'open-map': []
  }>()

  const isVisitable = computed(() => props.exhibition.status !== 'finished')

  const address = computed(() =>
    [props.exhibition.location.city, props.exhibition.location.addressLine]
      .filter(Boolean)
      .join(', '),
  )

  const entry = computed(
    () =>
      props.exhibition.ticketInfo?.trim() ||
      (props.exhibition.isFree ? 'Вход свободный' : ''),
  )
</script>
