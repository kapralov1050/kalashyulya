<template>
  <div class="animate-pulse pb-16">
    <!-- Hero skeleton -->
    <section
      class="relative mb-10 flex min-h-[60vh] items-end justify-center
        overflow-hidden bg-neutral-200 sm:min-h-[70vh] dark:bg-neutral-800"
    >
      <div class="container relative z-5 pb-12 pt-20">
        <div class="mx-auto max-w-4xl space-y-6 text-center">
          <div class="flex justify-center">
            <div
              class="h-7 w-28 rounded-full bg-neutral-300 dark:bg-neutral-600"
            />
          </div>
          <div class="flex justify-center">
            <div
              class="h-5 w-48 rounded-full bg-neutral-300 dark:bg-neutral-600"
            />
          </div>
          <div class="space-y-3">
            <div
              class="mx-auto h-10 w-3/4 rounded-xl bg-neutral-300
                dark:bg-neutral-600 sm:h-12 md:h-14"
            />
            <div
              class="mx-auto h-10 w-1/2 rounded-xl bg-neutral-300
                dark:bg-neutral-600 sm:h-12 md:h-14"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Back button skeleton -->
    <section class="container mb-8">
      <div
        class="h-8 w-36 rounded-lg bg-neutral-200 dark:bg-neutral-800"
      />
    </section>

    <!-- Schedule & Address skeleton -->
    <section
      class="container mb-10 grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
    >
      <!-- Schedule card -->
      <div
        class="rounded-2xl border border-neutral-200 bg-white px-6 py-5
          shadow-sm dark:border-neutral-800 dark:bg-neutral-900/70"
      >
        <div
          class="mb-4 h-3.5 w-28 rounded bg-neutral-200 dark:bg-neutral-700"
        />
        <div class="divide-y divide-neutral-100 dark:divide-neutral-800">
          <div
            v-for="i in 7"
            :key="i"
            class="flex items-center justify-between py-2.5"
          >
            <div
              class="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700"
            />
            <div
              class="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-700"
            />
          </div>
        </div>
      </div>

      <!-- Address card -->
      <div
        class="flex flex-col justify-between rounded-2xl border border-neutral-200
          bg-white px-6 py-5 shadow-sm dark:border-neutral-800
          dark:bg-neutral-900/70"
      >
        <div class="space-y-3">
          <div
            class="mb-1 h-3.5 w-16 rounded bg-neutral-200 dark:bg-neutral-700"
          />
          <div
            class="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700"
          />
          <div
            class="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700"
          />
          <div
            class="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700"
          />
        </div>
        <div
          class="mt-6 h-11 w-full rounded-xl bg-neutral-200 dark:bg-neutral-700"
        />
      </div>
    </section>

    <!-- Description card skeleton -->
    <section class="container mb-14">
      <div
        class="rounded-3xl bg-white px-6 py-8 shadow-sm ring-1 ring-neutral-100
          dark:bg-neutral-900/80 dark:ring-neutral-800"
      >
        <div
          class="mb-6 h-7 w-36 rounded-lg bg-neutral-200 dark:bg-neutral-700
            sm:h-8"
        />
        <div class="space-y-3">
          <div
            class="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700"
          />
          <div
            class="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700"
          />
          <div
            class="h-4 w-5/6 rounded bg-neutral-200 dark:bg-neutral-700"
          />
          <div
            class="mt-4 h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700"
          />
          <div
            class="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700"
          />
          <div
            class="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700"
          />
        </div>
      </div>
    </section>
  </div>
</template>
