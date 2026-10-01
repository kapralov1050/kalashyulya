<template>
  <div>
    <header
      class="container pt-10 pb-14 sm:pt-14 sm:pb-20 lg:grid lg:grid-cols-12
        lg:gap-x-16"
    >
      <h1 class="lg:col-span-7">
        <span class="sr-only">Календари 2026</span>
        <CalendarHandwrittenTitle />
      </h1>

      <CalendarContents
        v-if="calendars.length"
        :calendars="calendars"
        class="mt-8 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1
          lg:mt-0 lg:self-end"
      />

      <div
        class="mt-8 max-w-[60ch] space-y-4 text-lg leading-[1.6]
          text-neutral-800 dark:text-neutral-100 sm:mt-10 lg:col-span-7
          lg:col-start-1 lg:row-start-2"
      >
        <p>{{ printLocale('calendar_desc_1') }}</p>
        <p>
          {{ printLocale('calendar_desc_2_prefix') }}
          <strong class="font-semibold text-neutral-900 dark:text-white">{{
            printLocale('calendar_desc_2_highlight')
          }}</strong>{{ printLocale('calendar_desc_2_suffix') }}
        </p>
      </div>
    </header>

    <section aria-label="Календари">
      <div
        v-if="shopStore.isLoading"
        aria-hidden="true"
      >
        <div
          class="container grid animate-pulse gap-10 py-16 sm:py-24 lg:grid-cols-12
            lg:items-center lg:gap-x-16 lg:py-28"
        >
          <div
            class="aspect-[4/3] bg-neutral-200 dark:bg-neutral-800 lg:col-span-7"
          />
          <div class="space-y-3 lg:col-span-5">
            <div class="h-10 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div class="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div class="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
            <div class="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      </div>

      <template v-else-if="calendars.length">
        <CalendarFeature
          v-for="(calendar, index) in calendars"
          :key="calendar.id"
          :product="calendar"
          :reverse="index % 2 === 1"
        />
      </template>

      <div v-else class="container pb-16 sm:pb-24">
        <div
          class="max-w-2xl rounded-2xl bg-neutral-50 p-8 dark:bg-neutral-900/80"
          :role="shopStore.loadError ? 'alert' : undefined"
        >
          <template v-if="shopStore.loadError">
            <p class="text-lg font-medium text-neutral-900 dark:text-white">
              Не удалось загрузить календари
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
          <template v-else>
            <p class="text-lg font-medium text-neutral-900 dark:text-white">
              Календарей сейчас нет в продаже
            </p>
            <UButton
              to="/shop"
              color="neutral"
              variant="outline"
              size="lg"
              class="mt-6"
            >
              Перейти в магазин
            </UButton>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import CalendarContents from '~/components/calendar/Contents.vue'
  import CalendarFeature from '~/components/calendar/Feature.vue'
  import CalendarHandwrittenTitle from '~/components/calendar/HandwrittenTitle.vue'
  import { ProductCategory } from '~/constants/products'
  import type { Product } from '~/types'

  const { printLocale } = useLocales()
  const shopStore = useShopStore()

  useSeo({
    title: 'Календари 2026',
    description:
      'Календари 2026 с акварелями Юлии Калашниковой: настольный и настенный, ограниченный тираж.',
  })

  const availabilityRank = (product: Product) =>
    product.stock === 0 ? 2 : product.isReserved ? 1 : 0

  const calendars = computed(() =>
    Object.values(shopStore.shopData?.products ?? {})
      .filter(product => product.categoryId === ProductCategory.CALENDARS)
      .sort((a, b) => availabilityRank(a) - availabilityRank(b)),
  )

  const isRetrying = ref(false)
  const retry = async () => {
    isRetrying.value = true
    await shopStore.loadProducts().catch(() => undefined)
    isRetrying.value = false
  }
</script>
