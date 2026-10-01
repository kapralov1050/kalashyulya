<template>
  <div class="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-x-16">
    <section aria-labelledby="footer-social-title" class="lg:col-span-5">
      <h2
        id="footer-social-title"
        class="text-sm text-neutral-500 dark:text-neutral-400"
      >
        {{ toSentenceCase(printLocale('footer_links_title')) }}
      </h2>
      <ul class="mt-3 flex flex-wrap gap-x-8 gap-y-3">
        <li v-for="link in socialLinks" :key="link.href">
          <a
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-6 items-center gap-2 rounded-sm align-top text-[0.9375rem]
              font-medium text-neutral-900 underline decoration-neutral-300
              underline-offset-4 transition-colors hover:decoration-neutral-900
              focus-visible:outline-2 focus-visible:outline-offset-4
              focus-visible:outline-neutral-900 dark:text-white
              dark:decoration-neutral-600 dark:hover:decoration-white
              dark:focus-visible:outline-white"
            @click="metrics.trackButtonClick(link.metric)"
          >
            <img :src="link.icon" alt="" class="size-5 invert dark:invert-0" />
            {{ link.label }}
            <span class="sr-only">(откроется в новой вкладке)</span>
          </a>
        </li>
      </ul>
    </section>

    <nav aria-label="Информация для покупателей" class="lg:col-span-7">
      <ul
        class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8
          sm:gap-y-2"
      >
        <li v-for="link in infoLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="inline-flex min-h-6 items-center rounded-sm align-top text-sm
              text-neutral-600 underline-offset-4
              transition-colors hover:text-neutral-900 hover:underline
              focus-visible:outline-2 focus-visible:outline-offset-4
              focus-visible:outline-neutral-900 dark:text-neutral-300
              dark:hover:text-white dark:focus-visible:outline-white"
            @click="metrics.trackButtonClick(link.metric)"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
  import { metrics } from '~/utils/metrics'
  import { toSentenceCase } from '~/utils/sentenceCase'

  const { printLocale } = useLocales()

  const socialLinks = [
    {
      href: 'https://t.me/kalashyulyaa',
      label: 'Telegram',
      icon: '/links/telegram.svg',
      metric: 'telegramButton',
    },
    {
      href: 'https://vk.com/kalashyulya',
      label: 'ВКонтакте',
      icon: '/links/vk.svg',
      metric: 'vkButton',
    },
  ] as const

  const infoLinks = [
    { to: '/requisites', label: 'Реквизиты', metric: 'requisitesButton' },
    {
      to: '/privacy',
      label: 'Политика обработки ПДн',
      metric: 'privacyButton',
    },
    {
      to: '/shop/tracking',
      label: 'Отслеживание заказа',
      metric: 'trackingButton',
    },
  ] as const
</script>
