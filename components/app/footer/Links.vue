<template>
  <div class="w-full flex flex-col items-center justify-center sm:flex-row">
    <h3
      class="text-sm text-center font-semibold text-neutral-800 dark:text-white
        uppercase tracking-wide"
    >
      {{ printLocale('footer_links_title') }}
    </h3>

    <div class="ml-0 sm:ml-auto flex flex-col sm:flex-row">
      <!-- Social Links Container -->
      <div class="flex">
        <!-- Telegram -->
        <a
          href="https://t.me/kalashyulyaa"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-center space-x-3 p-3 rounded-lg
            hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors
            duration-200"
          @click="metrics.trackButtonClick('telegramButton')"
        >
          <div class="flex-shrink-0">
            <img
              src="/links/telegram.svg"
              alt="Telegram"
              class="w-6 h-6 group-hover:scale-110 transition-transform
                duration-200 invert dark:invert-0"
            />
          </div>
          <div class="flex flex-col">
            <span
              class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {{ printLocale('footer_telegram_title') }}
            </span>
            <span class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ printLocale('footer_linkname') }}
            </span>
          </div>
        </a>

        <!-- VK -->
        <a
          href="https://vk.com/kalashyulya"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-center space-x-3 p-3 rounded-lg
            hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors
            duration-200"
          @click="metrics.trackButtonClick('vkButton')"
        >
          <div class="flex-shrink-0">
            <img
              src="/links/vk.svg"
              alt="VKontakte"
              class="w-6 h-6 group-hover:scale-110 transition-transform
                duration-200 invert dark:invert-0"
            />
          </div>
          <div class="flex flex-col">
            <span
              class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {{ printLocale('footer_vk_title') }}
            </span>
            <span class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ printLocale('footer_linkname') }}
            </span>
          </div>
        </a>
      </div>

      <!-- Requisites Link -->
      <NuxtLink
        to="/requisites"
        class="group flex items-center justify-center space-x-3 p-3 rounded-lg
          hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors
          duration-200 sm:ml-2"
        @click="metrics.trackButtonClick('requisitesButton')"
      >
        <div class="flex flex-col text-center sm:text-left">
          <span
            class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Реквизиты
          </span>
          <span class="text-xs text-neutral-500 dark:text-neutral-400">
            Информация о продавце
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  const { printLocale } = useLocales()
</script>

<style scoped lang="scss"></style>
