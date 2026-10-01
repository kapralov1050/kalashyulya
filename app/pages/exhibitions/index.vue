<template>
  <div class="pb-16 sm:pb-24">
    <header class="container pt-10 sm:pt-14">
      <h1
        class="text-[2rem] font-bold leading-[1.08] tracking-[-0.02em]
          text-neutral-900 dark:text-white sm:text-5xl"
      >
        {{ printLocale('exhibitions_page_heading') }}
      </h1>
      <p
        class="mt-4 max-w-[60ch] text-lg leading-[1.6] text-neutral-700
          dark:text-neutral-200"
      >
        {{ printLocale('exhibitions_page_subheading') }}
      </p>
    </header>

    <div class="container mt-12 sm:mt-16">
      <template v-if="isLoading">
        <p role="status" class="sr-only">Загружаем выставки</p>
        <ul
          aria-hidden="true"
          :class="gridClasses"
          class="animate-pulse motion-reduce:animate-none"
        >
          <li v-for="i in 4" :key="i">
            <div class="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800" />
            <div class="mt-5 h-7 w-56 rounded-full bg-neutral-100 dark:bg-neutral-800" />
            <div class="mt-3 h-7 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800" />
            <div class="mt-2 h-5 w-1/2 rounded bg-neutral-100 dark:bg-neutral-800" />
          </li>
        </ul>
      </template>

      <ul v-else-if="sortedExhibitions.length" role="list" :class="gridClasses">
        <li v-for="(exhibition, index) in sortedExhibitions" :key="exhibition.id">
          <ExhibitionListItem :exhibition="exhibition" :priority="index < 2" />
        </li>
      </ul>

      <div
        v-else
        class="max-w-2xl rounded-2xl bg-neutral-50 p-8 dark:bg-neutral-900/80"
        :role="loadError ? 'alert' : undefined"
      >
        <template v-if="loadError">
          <p class="text-lg font-medium text-neutral-900 dark:text-white">
            Не удалось загрузить выставки
          </p>
          <p class="mt-1 text-neutral-600 dark:text-neutral-300">
            Проверьте соединение и попробуйте ещё раз.
          </p>
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            class="mt-6"
            :loading="isRetrying"
            @click="retry"
          >
            Загрузить снова
          </UButton>
        </template>
        <p v-else class="text-lg font-medium text-neutral-900 dark:text-white">
          Выставок пока нет
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import ExhibitionListItem from '~/components/exhibitions/ExhibitionListItem.vue'
  import { sortExhibitionsForList } from '~/utils/exhibitionList'

  const { printLocale } = useLocales()

  definePageMeta({
    layout: 'default',
  })

  useSeo({
    title: 'Выставки',
    description: 'Актуальные и прошедшие выставки художника.',
    image: '/logo.png',
  })

  const exhibitionsStore = useExhibitionsStore()
  const { exhibitions, isLoading, loadError } = storeToRefs(exhibitionsStore)

  const sortedExhibitions = computed(() =>
    sortExhibitionsForList(exhibitions.value),
  )

  const gridClasses =
    'grid gap-y-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16 lg:gap-x-16 lg:gap-y-24'

  const isRetrying = ref(false)
  const retry = async () => {
    isRetrying.value = true
    await exhibitionsStore.loadExhibitions().catch(() => undefined)
    isRetrying.value = false
  }
</script>
