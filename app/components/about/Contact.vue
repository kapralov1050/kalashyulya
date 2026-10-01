<template>
  <section aria-labelledby="home-contact-title" class="container">
    <div
      class="grid gap-12 border-t border-neutral-200 pt-16 dark:border-neutral-800
        sm:pt-24 lg:grid-cols-12 lg:items-end lg:gap-x-16"
    >
      <div class="lg:col-span-7">
        <h2
          id="home-contact-title"
          class="text-balance text-[1.875rem] font-semibold leading-tight
            tracking-[-0.01em] text-neutral-900 dark:text-white sm:text-4xl"
        >
          Картина на заказ
        </h2>
        <p
          class="mt-6 max-w-[60ch] text-lg leading-[1.6] text-neutral-800
            dark:text-neutral-100"
        >
          Если хотите картину на заказ или у вас есть вопрос о работе —
          напишите мне. Обсудим сюжет, размер и сроки, пришлю дополнительные
          фото.
        </p>

        <div class="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <UButton
            to="https://t.me/kalashyulyaa"
            target="_blank"
            color="neutral"
            size="xl"
            class="gap-2.5 px-6"
            @click="trackClick('telegramButton')"
          >
            <img
              src="/links/telegram.svg"
              alt=""
              class="size-5 dark:invert"
            />
            Написать в Telegram
            <span class="sr-only">(откроется в новой вкладке)</span>
          </UButton>
          <a
            href="https://vk.com/kalashyulya"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-sm text-[0.9375rem] font-medium text-neutral-900
              underline decoration-neutral-300 underline-offset-4
              hover:decoration-neutral-900 focus-visible:outline-2
              focus-visible:outline-offset-4 focus-visible:outline-neutral-900
              dark:text-white dark:decoration-neutral-600
              dark:hover:decoration-white dark:focus-visible:outline-white"
            @click="trackClick('vkButton')"
          >
            или во ВКонтакте
            <span class="sr-only">(откроется в новой вкладке)</span>
          </a>
        </div>
      </div>

      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        width="635"
        height="331"
        class="h-24 w-auto justify-self-start dark:invert sm:h-32 lg:col-span-5
          lg:justify-self-end"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
  const trackClick = (name: string) => metrics.trackButtonClick(name)
</script>
