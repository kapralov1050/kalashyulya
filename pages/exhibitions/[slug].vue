<template>
  <div class="pb-16">
    <!-- Обложка выставки -->
    <section
      v-if="exhibition?.coverImage"
      class="relative mb-10 flex min-h-[60vh] items-end justify-center
        overflow-hidden sm:min-h-[70vh]"
    >
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        :style="{
          backgroundImage: `url(${exhibition.coverImage})`,
        }"
      >
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30
            to-transparent"
        />
      </div>

      <div class="container relative z-10 pb-12 pt-20">
        <div class="mx-auto max-w-4xl space-y-6 text-center text-white">
          <!-- Статус -->
          <div
            class="inline-flex items-center gap-2 rounded-full px-4 py-1.5
              text-sm font-semibold text-white"
            :class="statusBadgeClasses"
          >
            <span class="inline-block size-2 rounded-full bg-white/90" />
            <span>{{ statusLabel }}</span>
          </div>

          <!-- Даты -->
          <p class="text-lg font-medium sm:text-xl">
            {{ exhibition.dateRange }}
          </p>

          <!-- Заголовок -->
          <h1
            class="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl
              lg:text-6xl"
          >
            {{ exhibition.title }}
          </h1>
        </div>
      </div>
    </section>

    <!-- Если нет обложки, показываем обычный заголовок -->
    <section v-else class="container mb-8 pt-10">
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-heroicons-arrow-left"
        class="mb-4 px-0 text-sm text-neutral-600 hover:text-neutral-900
          dark:text-neutral-300 dark:hover:text-white"
        to="/exhibitions"
      >
        Назад к выставкам
      </UButton>

      <div
        class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div class="space-y-3">
          <p
            class="text-xs font-semibold uppercase tracking-[0.18em]
              text-neutral-500 dark:text-neutral-400"
          >
            Выставка
          </p>
          <h1
            class="max-w-3xl text-3xl font-black tracking-tight text-neutral-900
              dark:text-white sm:text-4xl"
          >
            {{ exhibition?.title }}
          </h1>
          <p class="text-sm font-medium text-neutral-600 dark:text-neutral-300">
            {{ exhibition?.dateRange }}
          </p>
        </div>

        <div
          v-if="exhibition"
          class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs
            font-semibold text-white"
          :class="statusBadgeClasses"
        >
          <span class="inline-block size-1.5 rounded-full bg-white/90" />
          <span>{{ statusLabel }}</span>
        </div>
      </div>
    </section>

    <!-- Кнопка "Назад" для страниц с обложкой -->
    <section v-if="exhibition?.coverImage" class="container mb-8">
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
    </section>

    <!-- Расписание и адрес -->
    <ExhibitionScheduleAddress
      v-if="exhibition"
      :schedule="exhibition.schedule"
      :location="exhibition.location"
      @open-map="isMapOpen = true"
    />

    <!-- О выставке -->
    <section class="container mb-14">
      <div
        class="rounded-3xl bg-white px-6 py-8 shadow-sm ring-1 ring-neutral-100
          dark:bg-neutral-900/80 dark:ring-neutral-800"
      >
        <h2
          class="mb-4 text-2xl font-semibold tracking-tight text-neutral-900
            dark:text-white sm:text-3xl"
        >
          О выставке
        </h2>
        <div class="space-y-4 text-neutral-700 dark:text-neutral-200">
          <p>{{ exhibition?.descriptionIntro }}</p>
          <p>{{ exhibition?.descriptionBody }}</p>
        </div>
      </div>
    </section>

    <!-- Модалка с картой -->
    <UModal
      v-model:open="isMapOpen"
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
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-white">
              На карте
            </h3>
            <UButton
              icon="i-heroicons-x-mark"
              variant="ghost"
              color="neutral"
              class="rounded-full"
              @click="isMapOpen = false"
            />
          </div>

          <div class="relative h-full w-full">
            <!-- Шиммер / спиннер пока карта грузится -->
            <div
              v-if="isMapLoading"
              class="absolute inset-0 z-10 flex items-center justify-center
                bg-white"
            >
              <div class="spinner" />
            </div>

            <iframe
              v-if="mapUrl"
              :src="mapUrl"
              class="h-full w-full border-0"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
              @load="handleMapLoad"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Галерея -->
    <ExhibitionGallery v-if="exhibition" :works="exhibition.works" />

    <section
      v-if="!exhibition"
      class="container flex min-h-[40vh] items-center justify-center"
    >
      <p class="text-neutral-600 dark:text-neutral-300">
        Выставка не найдена. Проверьте ссылку или вернитесь к списку выставок.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
  import ExhibitionGallery from '~/components/exhibitions/ExhibitionGallery.vue'
  import ExhibitionScheduleAddress from '~/components/exhibitions/ExhibitionScheduleAddress.vue'

  definePageMeta({
    layout: 'default',
  })

  const route = useRoute()
  const exhibitionsStore = useExhibitionsStore()

  const slug = computed(() => route.params.slug as string)
  const exhibitionRef = exhibitionsStore.getBySlug(slug.value)
  const exhibition = computed(() => exhibitionRef.value)

  const isMapOpen = ref(false)
  const isMapLoading = ref(true)

  const mapUrl = computed(() => {
    if (!exhibition.value) return ''

    // 1) Если в данных уже есть готовая ссылка на виджет Яндекс.Карт — используем её
    if (exhibition.value.location.mapLink) {
      return exhibition.value.location.mapLink
    }

    // 2) Иначе формируем URL поиска по адресу
    const parts = [
      exhibition.value.location.city,
      exhibition.value.location.addressLine,
      exhibition.value.location.venue,
    ].filter(Boolean)

    const query = encodeURIComponent(parts.join(', '))

    // Встраиваемый виджет Яндекс.Карт по текстовому запросу
    return `https://yandex.ru/map-widget/v1/?text=${query}`
  })

  const statusLabel = computed(() =>
    exhibition.value
      ? exhibitionsStore.getStatusLabel(exhibition.value.status)
      : '',
  )

  const statusBadgeClasses = computed(() => {
    if (!exhibition.value) return 'bg-neutral-600'

    switch (exhibition.value.status) {
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

  useSeo({
    title: exhibition.value?.title || 'Выставка',
    description: exhibition.value?.shortDescription || 'Выставка художника.',
    image: exhibition.value?.coverImage || '/logo.png',
  })

  onMounted(async () => {
    metrics.trackPageView(`exhibitions-${slug.value}`)
  })

  watch(isMapOpen, open => {
    if (open) {
      isMapLoading.value = true
    }
  })

  const handleMapLoad = () => {
    setTimeout(() => {
      isMapLoading.value = false
    }, 2000)
  }
</script>
