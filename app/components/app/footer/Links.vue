<template>
  <div class="w-full flex flex-col gap-6">
    <!-- Соцсети: крупные иконки, выделенный блок -->
    <div class="flex flex-col items-center gap-3">
      <h3
        class="text-sm text-center font-semibold text-neutral-800 dark:text-white
          uppercase tracking-wide"
      >
        {{ printLocale('footer_links_title') }}
      </h3>

      <div class="flex items-center gap-3">
        <!-- Telegram -->
        <a
          href="https://t.me/kalashyulyaa"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram"
          class="group flex items-center justify-center w-11 h-11 rounded-full
            bg-neutral-100 hover:bg-primary-500 dark:bg-neutral-800
            dark:hover:bg-primary-500 transition-colors duration-200"
          @click="metrics.trackButtonClick('telegramButton')"
        >
          <img
            src="/links/telegram.svg"
            alt=""
            class="w-6 h-6 invert dark:invert-0 group-hover:invert group-hover:brightness-0
              group-hover:contrast-200 transition duration-200"
          />
        </a>

        <!-- VK -->
        <a
          href="https://vk.com/kalashyulya"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="VKontakte"
          class="group flex items-center justify-center w-11 h-11 rounded-full
            bg-neutral-100 hover:bg-primary-500 dark:bg-neutral-800
            dark:hover:bg-primary-500 transition-colors duration-200"
          @click="metrics.trackButtonClick('vkButton')"
        >
          <img
            src="/links/vk.svg"
            alt=""
            class="w-6 h-6 invert dark:invert-0 group-hover:invert group-hover:brightness-0
              group-hover:contrast-200 transition duration-200"
          />
        </a>
      </div>
    </div>

    <!-- Утилитарные ссылки: мелко, единой строкой -->
    <div
      class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1
        text-xs text-neutral-500 dark:text-neutral-400"
    >
      <NuxtLink
        to="/requisites"
        class="hover:text-neutral-700 dark:hover:text-neutral-200
          transition-colors"
        @click="metrics.trackButtonClick('requisitesButton')"
      >
        Реквизиты
      </NuxtLink>
      <span aria-hidden="true">·</span>
      <NuxtLink
        to="/privacy"
        class="hover:text-neutral-700 dark:hover:text-neutral-200
          transition-colors"
        @click="metrics.trackButtonClick('privacyButton')"
      >
        Политика обработки ПДн
      </NuxtLink>
      <span aria-hidden="true">·</span>
      <NuxtLink
        to="/shop/tracking"
        class="hover:text-neutral-700 dark:hover:text-neutral-200
          transition-colors"
        @click="metrics.trackButtonClick('trackingButton')"
      >
        Отслеживание заказа
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { metrics } from '~/utils/metrics'
  const { printLocale } = useLocales()
</script>

<style scoped lang="scss"></style>
