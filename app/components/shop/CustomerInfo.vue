<template>
  <div
    class="space-y-10 text-base leading-[1.7] text-neutral-800
      dark:text-neutral-100"
  >
    <section>
      <p class="text-lg font-semibold text-neutral-900 dark:text-white">
        {{ printLocale('shop_info_welcome_title') }}
      </p>
      <p class="mt-2">{{ printLocale('shop_info_welcome_text') }}</p>
    </section>

    <section aria-labelledby="info-pictures">
      <h3 id="info-pictures" :class="headingClass">
        {{ printLocale('shop_info_pictures_title') }}
      </h3>
      <p class="mt-2">{{ printLocale('shop_info_pictures_desc') }}</p>
      <ul :class="['mt-3', listClass]">
        <li v-for="key in picturePoints" :key="key">{{ printLocale(key) }}</li>
      </ul>

      <h4 :class="['mt-6', subheadingClass]">
        {{ printLocale('shop_info_help_title') }}
      </h4>
      <ul :class="['mt-2', listClass]">
        <li v-for="key in helpPoints" :key="key">{{ printLocale(key) }}</li>
      </ul>
    </section>

    <section class="grid gap-x-10 gap-y-8 sm:grid-cols-2">
      <div
        v-for="group in productGroups"
        :key="group.title"
        class="border-t border-neutral-200 pt-4 dark:border-neutral-800"
      >
        <h3 :class="headingClass">{{ printLocale(group.title) }}</h3>
        <p class="mt-1 text-[0.9375rem] text-neutral-600 dark:text-neutral-300">
          {{ printLocale(group.desc) }}
        </p>
        <ul :class="['mt-3 text-[0.9375rem]', listClass]">
          <li v-for="point in group.points" :key="String(point)">
            <template v-if="Array.isArray(point)">
              <span class="font-medium text-neutral-900 dark:text-white">
                {{ printLocale(point[0]) }}
              </span>
              — {{ lowerFirst(printLocale(point[1])) }}
            </template>
            <template v-else>{{ printLocale(point) }}</template>
          </li>
        </ul>
      </div>
    </section>

    <section aria-labelledby="info-payment">
      <h3 id="info-payment" :class="headingClass">
        {{ printLocale('shop_info_payment_title') }}
      </h3>

      <h4 :class="['mt-4', subheadingClass]">
        {{ printLocale('shop_info_payment_methods_title') }}
      </h4>
      <p class="mt-1">{{ printLocale('shop_info_payment_methods_desc') }}</p>
      <ul :class="['mt-3', listClass]">
        <li v-for="key in paymentPoints" :key="key">{{ printLocale(key) }}</li>
      </ul>

      <h4 :class="['mt-6', subheadingClass]">
        {{ printLocale('shop_info_delivery_title') }}
      </h4>
      <ul :class="['mt-2', listClass]">
        <li v-for="key in deliveryPoints" :key="key">{{ printLocale(key) }}</li>
      </ul>
    </section>

    <section class="border-t border-neutral-200 pt-6 dark:border-neutral-800">
      <p>{{ printLocale('shop_info_cta') }}</p>
      <a
        href="https://t.me/kalashyulyaa"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-3 inline-flex items-center gap-2 rounded-sm text-[0.9375rem]
          font-medium text-neutral-900 underline decoration-neutral-300
          underline-offset-4 hover:decoration-neutral-900 focus-visible:outline-2
          focus-visible:outline-offset-4 focus-visible:outline-neutral-900
          dark:text-white dark:decoration-neutral-600 dark:hover:decoration-white
          dark:focus-visible:outline-white"
        @click="trackClick('telegramButton')"
      >
        Написать в Telegram
        <span class="sr-only">(откроется в новой вкладке)</span>
      </a>
    </section>
  </div>
</template>

<script setup lang="ts">
  const { printLocale } = useLocales()

  const trackClick = (name: string) => metrics.trackButtonClick(name)

  const headingClass =
    'text-lg font-semibold text-neutral-900 dark:text-white'
  const subheadingClass = 'font-medium text-neutral-900 dark:text-white'
  const listClass =
    'space-y-1.5 pl-5 [&>li]:list-disc marker:text-neutral-400 dark:marker:text-neutral-500'

  const picturePoints = [
    'shop_info_pictures_point1',
    'shop_info_pictures_point2',
    'shop_info_pictures_point3',
  ]
  const helpPoints = ['shop_info_help_point1', 'shop_info_help_point2']
  const paymentPoints = ['shop_info_payment_point1', 'shop_info_payment_point2']
  const deliveryPoints = [
    'shop_info_delivery_point1',
    'shop_info_delivery_point2',
    'shop_info_delivery_point3',
  ]

  const lowerFirst = (text: string) =>
    text.charAt(0).toLowerCase() + text.slice(1)

  const productGroups: {
    title: string
    desc: string
    points: (string | [string, string])[]
  }[] = [
    {
      title: 'shop_info_framed_title',
      desc: 'shop_info_framed_desc',
      points: ['shop_info_framed_point1', 'shop_info_framed_point2'],
    },
    {
      title: 'shop_info_sketches_title',
      desc: 'shop_info_sketches_desc',
      points: ['shop_info_sketches_point1', 'shop_info_sketches_point2'],
    },
    {
      title: 'shop_info_posters_title',
      desc: 'shop_info_posters_desc',
      points: ['shop_info_posters_point1', 'shop_info_posters_point2'],
    },
    {
      title: 'shop_info_postcards_title',
      desc: 'shop_info_postcards_desc',
      points: [
        ['shop_info_postcards_subtitle', 'shop_info_postcards_sub_desc'],
        ['shop_info_stickers_subtitle', 'shop_info_stickers_sub_desc'],
      ],
    },
  ]
</script>
