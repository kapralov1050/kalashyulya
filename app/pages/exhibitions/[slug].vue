<template>
  <div class="pb-16">
    <!-- Skeleton пока данные грузятся из Firebase -->
    <ExhibitionPageSkeleton v-if="isLoading" />

    <!-- Основной контент -->
    <template v-else-if="exhibition">
      <div class="container pt-6 sm:pt-8">
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-heroicons-arrow-left"
          class="px-0 text-sm text-neutral-600 hover:text-neutral-900
            dark:text-neutral-300 dark:hover:text-white"
          to="/exhibitions"
        >
          Назад к выставкам
        </UButton>

        <header
          class="mt-6 grid gap-8 sm:mt-8 lg:grid-cols-12 lg:items-start
            lg:gap-x-16"
        >
          <div
            :class="
              exhibition.coverImage ? 'lg:col-span-5' : 'max-w-3xl lg:col-span-12'
            "
          >
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
              <ExhibitionStatusBadge :status="exhibition.status" />
              <p
                class="text-base font-medium text-neutral-600
                  dark:text-neutral-300"
              >
                {{ formatExhibitionDates(exhibition.dateRange) }}
              </p>
            </div>

            <h1
              class="mt-5 whitespace-pre-line text-balance text-[2rem] font-bold
                leading-[1.08] tracking-[-0.02em] text-neutral-900
                dark:text-white"
              :class="isLongTitle ? 'sm:text-4xl' : 'sm:text-5xl'"
            >
              {{ toLines(exhibition.title) }}
            </h1>

            <div v-if="introParagraphs.length" class="mt-6 space-y-4 lg:mt-8">
              <p
                v-for="(paragraph, index) in introParagraphs"
                :key="`intro-${index}`"
                class="max-w-[60ch] whitespace-pre-line text-lg leading-[1.6]
                  text-neutral-800 dark:text-neutral-100"
              >
                {{ paragraph }}
              </p>
            </div>
          </div>

          <img
            v-if="exhibition.coverImage"
            :src="exhibition.coverImage"
            :alt="toSingleLine(exhibition.title)"
            fetchpriority="high"
            style="aspect-ratio: auto 4 / 3"
            class="h-auto w-full bg-neutral-100
              shadow-[0_1px_2px_rgb(0_0_0/0.08),0_24px_48px_-28px_rgb(0_0_0/0.45)]
              dark:bg-neutral-800 dark:shadow-none lg:col-span-7"
          />
        </header>

        <div
          class="mt-12 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-x-16"
        >
          <aside class="lg:col-span-5">
            <div class="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
              <ExhibitionVisitInfo
                :exhibition="exhibition"
                @open-map="isMapOpen = true"
              />
            </div>
          </aside>

          <section v-if="bodyParagraphs.length" class="lg:col-span-7">
            <h2
              class="text-2xl font-semibold tracking-[-0.01em] text-neutral-900
                dark:text-white sm:text-3xl"
            >
              О выставке
            </h2>
            <div class="mt-6 max-w-[65ch] space-y-5">
              <p
                v-for="(paragraph, index) in bodyParagraphs"
                :key="`body-${index}`"
                class="whitespace-pre-line text-[1.0625rem] leading-[1.75]
                  text-neutral-700 dark:text-neutral-200"
              >
                {{ paragraph }}
              </p>
            </div>
          </section>
        </div>
      </div>

      <!-- Галерея -->
      <ExhibitionGallery
        v-if="exhibition.status !== 'planned'"
        class="mt-20 lg:mt-32"
        :works="exhibition.works"
        :status="exhibition.status"
      />
    </template>

    <section
      v-else-if="loadError"
      class="container py-24 sm:py-32"
      role="alert"
    >
      <h1
        class="text-3xl font-bold tracking-[-0.02em] text-neutral-900
          dark:text-white sm:text-4xl"
      >
        Не удалось загрузить выставку
      </h1>
      <p class="mt-4 text-[1.0625rem] text-neutral-600 dark:text-neutral-300">
        Проверьте соединение и попробуйте ещё раз.
      </p>
      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        class="mt-8"
        :loading="isRetrying"
        @click="retry"
      >
        Загрузить снова
      </UButton>
    </section>

    <section v-else class="container py-24 sm:py-32">
      <h1
        class="text-3xl font-bold tracking-[-0.02em] text-neutral-900
          dark:text-white sm:text-4xl"
      >
        Выставка не найдена
      </h1>
      <p class="mt-4 text-[1.0625rem] text-neutral-600 dark:text-neutral-300">
        Проверьте ссылку или вернитесь к списку выставок.
      </p>
      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        icon="i-heroicons-arrow-left"
        class="mt-8"
        to="/exhibitions"
      >
        Назад к выставкам
      </UButton>
    </section>

    <!-- Модалка с картой -->
    <UModal
      v-model:open="isMapOpen"
      :title="exhibition?.location.venue || 'На карте'"
      :description="mapDescription"
      :ui="{
        overlay: 'bg-black/60 backdrop-blur-sm',
        content: 'w-full max-w-3xl h-[70vh] p-0 overflow-hidden rounded-2xl',
      }"
    >
      <template #content>
        <div class="flex h-full flex-col">
          <div
            class="flex items-center justify-between border-b border-neutral-200
              px-4 py-3 dark:border-neutral-700"
          >
            <p
              aria-hidden="true"
              class="text-sm font-semibold text-neutral-900 dark:text-white"
            >
              {{ exhibition?.location.venue || 'На карте' }}
            </p>
            <UButton
              icon="i-heroicons-x-mark"
              variant="ghost"
              color="neutral"
              class="rounded-full"
              aria-label="Закрыть карту"
              @click="() => { isMapOpen = false }"
            />
          </div>

          <div class="relative h-full w-full">
            <!-- Шиммер / спиннер пока карта грузится -->
            <div
              v-if="isMapLoading"
              class="absolute inset-0 z-10 flex items-center justify-center
                bg-white dark:bg-neutral-900"
            >
              <div class="spinner" />
            </div>

            <iframe
              v-if="mapUrl"
              :src="mapUrl"
              :title="`Карта: ${exhibition?.location.venue || 'место выставки'}`"
              class="h-full w-full border-0"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
              @load="handleMapLoad"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
  import ExhibitionGallery from '~/components/exhibitions/ExhibitionGallery.vue'
  import ExhibitionPageSkeleton from '~/components/exhibitions/ExhibitionPageSkeleton.vue'
  import ExhibitionStatusBadge from '~/components/exhibitions/ExhibitionStatusBadge.vue'
  import ExhibitionVisitInfo from '~/components/exhibitions/ExhibitionVisitInfo.vue'
  import { formatExhibitionDates } from '~/utils/exhibitionList'

  definePageMeta({
    layout: 'default',
  })

  const route = useRoute()
  const exhibitionsStore = useExhibitionsStore()

  const slug = computed(() => route.params.slug as string)
  const exhibitionRef = exhibitionsStore.getBySlug(slug.value)
  const exhibition = computed(() => exhibitionRef.value)
  const isLoading = computed(() => exhibitionsStore.isLoading)
  const loadError = computed(() => exhibitionsStore.loadError)

  const isRetrying = ref(false)
  const retry = async () => {
    isRetrying.value = true
    await exhibitionsStore.loadExhibitions().catch(() => undefined)
    isRetrying.value = false
  }

  const toLines = (text: string) =>
    text
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .trim()

  const toSingleLine = (text: string) => toLines(text).replace(/\n+/g, ' ')

  const isLongTitle = computed(
    () => toSingleLine(exhibition.value?.title || '').length > 60,
  )

  const toParagraphs = (text?: string) =>
    toLines(text || '')
      .split(/\n{2,}/)
      .filter(Boolean)

  const introParagraphs = computed(() =>
    toParagraphs(exhibition.value?.descriptionIntro),
  )
  const bodyParagraphs = computed(() =>
    toParagraphs(exhibition.value?.descriptionBody),
  )

  const isMapOpen = ref(false)
  const isMapLoading = ref(true)

  const mapUrl = computed(() => {
    if (!exhibition.value) return ''

    if (exhibition.value.location.mapLink) {
      return exhibition.value.location.mapLink
    }

    const parts = [
      exhibition.value.location.city,
      exhibition.value.location.addressLine,
      exhibition.value.location.venue,
    ].filter(Boolean)

    const query = encodeURIComponent(parts.join(', '))
    return `https://yandex.ru/map-widget/v1/?text=${query}`
  })

  const mapDescription = computed(() =>
    [exhibition.value?.location.city, exhibition.value?.location.addressLine]
      .filter(Boolean)
      .join(', '),
  )

  useSeo({
    title: exhibition.value
      ? toSingleLine(exhibition.value.tabTitle)
      : undefined,
    description: exhibition.value?.shortDescription || 'Выставка художника.',
    image: exhibition.value?.coverImage || '/logo.png',
  })

  watch(isMapOpen, open => {
    if (open) {
      isMapLoading.value = true
    }
  })

  const handleMapLoad = () => {
    setTimeout(() => {
      isMapLoading.value = false
    }, 1000)
  }
</script>
