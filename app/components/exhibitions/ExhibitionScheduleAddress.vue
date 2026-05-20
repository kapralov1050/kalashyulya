<template>
  <section
    class="container mb-10 grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
  >
    <!-- Расписание -->
    <div
      class="rounded-2xl border border-neutral-200 bg-white px-6 py-5 shadow-sm
        dark:border-neutral-800 dark:bg-neutral-900/70"
    >
      <h2
        class="mb-4 text-sm font-semibold uppercase tracking-[0.18em]
          text-neutral-500 dark:text-neutral-400"
      >
        Часы работы
      </h2>

      <dl class="divide-y divide-neutral-100 dark:divide-neutral-800">
        <div
          v-for="day in schedule"
          :key="day.id"
          class="flex items-center justify-between py-2.5 text-sm"
        >
          <dt class="text-neutral-700 dark:text-neutral-200">
            {{ day.label }}
          </dt>
          <dd
            class="text-right text-neutral-900 dark:text-neutral-50"
            :class="day.isClosed ? 'text-rose-500 dark:text-rose-400' : ''"
          >
            {{ day.time }}
          </dd>
        </div>
      </dl>
    </div>

    <!-- Адрес -->
    <div
      class="flex flex-col justify-between rounded-2xl border border-neutral-200
        bg-white px-6 py-5 shadow-sm dark:border-neutral-800
        dark:bg-neutral-900/70"
    >
      <div class="space-y-3">
        <h2
          class="text-sm font-semibold uppercase tracking-[0.18em]
            text-neutral-500 dark:text-neutral-400"
        >
          Адрес
        </h2>

        <p class="text-sm font-medium text-neutral-900 dark:text-neutral-50">
          {{ location.venue }}
        </p>
        <p class="text-sm text-neutral-700 dark:text-neutral-200">
          {{ location.city }}, {{ location.addressLine }}
        </p>

        <p
          v-if="location.metro?.length"
          class="flex items-start gap-2 text-sm text-neutral-600
            dark:text-neutral-300"
        >
          <UIcon
            name="i-heroicons-map-pin"
            class="mt-0.5 h-5 w-5 text-neutral-400 dark:text-neutral-500"
          />
          <span>
            Станция метро:
            <span class="font-medium">
              {{ location.metro.join(', ') }}
            </span>
          </span>
        </p>
      </div>

      <div class="mt-6">
        <UButton
          color="neutral"
          size="lg"
          variant="outline"
          class="w-full justify-center"
          @click="$emit('open-map')"
        >
          Посмотреть на карте
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { ExhibitionLocation, ExhibitionScheduleDay } from '~/types'

  defineProps<{
    schedule: ExhibitionScheduleDay[]
    location: ExhibitionLocation
  }>()

  defineEmits<{
    'open-map': []
  }>()
</script>


