<template>
  <section
    aria-labelledby="about-title"
    class="container grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-x-16"
  >
    <div class="lg:col-span-5">
      <h2
        id="about-title"
        class="text-[1.875rem] font-semibold leading-tight tracking-[-0.01em]
          text-neutral-900 dark:text-white sm:text-4xl"
      >
        {{ toSentenceCase(printLocale('about_hero_title')) }}
      </h2>
      <p
        class="mt-6 max-w-[60ch] text-lg leading-[1.6] text-neutral-800
          dark:text-neutral-100"
      >
        {{ printLocale('about_hero_text') }}
      </p>
    </div>

    <img
      src="/about-hero.webp"
      alt="Юлия Калашникова пишет акварель на пленэре"
      class="h-auto w-full lg:col-span-7"
    />
  </section>
</template>

<script setup lang="ts">
  import { toSentenceCase } from '~/utils/sentenceCase'

  const { printLocale } = useLocales()
</script>
