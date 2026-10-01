<template>
  <nav aria-label="Календари на странице">
    <ul
      class="divide-y divide-neutral-200 border-y border-neutral-200
        dark:divide-neutral-800 dark:border-neutral-800"
    >
      <li v-for="calendar in calendars" :key="calendar.id">
        <a
          :href="`#${calendarAnchorId(calendar)}`"
          class="group flex items-center gap-4 py-4 focus-visible:outline-2
            focus-visible:outline-offset-4 focus-visible:outline-neutral-900
            dark:focus-visible:outline-white sm:gap-5"
          @click="scrollToCalendar($event, calendar)"
        >
          <span class="grid size-20 shrink-0 place-items-center sm:size-24">
            <img
              :src="calendar.image[0] || '/default-shop-image.png'"
              alt=""
              class="max-h-full max-w-full object-contain
                shadow-[0_1px_2px_rgb(0_0_0/0.08),0_14px_28px_-18px_rgb(0_0_0/0.4)]
                dark:shadow-none"
            />
          </span>

          <span class="min-w-0 flex-1">
            <span
              class="block font-medium text-neutral-900 decoration-1
                underline-offset-4 group-hover:underline dark:text-white"
            >
              {{ calendar.title.trim() }}
            </span>
            <span
              class="mt-1 block text-[0.9375rem] tabular-nums text-neutral-600
                dark:text-neutral-300"
            >
              {{ status(calendar) }}
            </span>
          </span>

          <UIcon
            name="heroicons:arrow-down-20-solid"
            class="size-5 shrink-0 text-neutral-500 transition-transform
              duration-200 ease-[var(--ease-out-strong)] group-hover:translate-y-0.5
              dark:text-neutral-400"
          />
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
  import type { Product } from '~/types'
  import { calendarAnchorId } from '~/utils/calendar'
  import { prefersReducedMotion } from '~/utils/motion'
  import { formatPrice } from '~/utils/productFormat'

  defineProps<{
    calendars: Product[]
  }>()

  const { printLocale } = useLocales()

  const status = (calendar: Product) =>
    calendar.stock === 0
      ? printLocale('shop_item_sold')
      : calendar.isReserved
        ? printLocale('shop_item_reserved_detail')
        : formatPrice(calendar.price)

  function scrollToCalendar(event: MouseEvent, calendar: Product) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const target = document.getElementById(calendarAnchorId(calendar))
    if (!target) return

    event.preventDefault()
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
    target.focus({ preventScroll: true })
  }
</script>
