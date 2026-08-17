<template>
  <div class="container flex flex-col items-center justify-center mb-20 pt-20">
    <div class="w-full max-w-2xl mx-auto text-center">
      <h1
        class="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white
          mb-6"
      >
        Запрос на обработку персональных данных
      </h1>
      <p class="text-neutral-600 dark:text-neutral-400 text-base mb-8">
        Эта страница в разработке. Для запросов, связанных с обработкой
        персональных данных (получение информации, уточнение, удаление),
        пишите на
        <a
          href="mailto:kalashnikova199979@gmail.com"
          class="text-primary-500 hover:underline"
        >
          kalashnikova199979@gmail.com
        </a>.
      </p>
      <UButton
        to="/"
        color="primary"
        variant="outline"
        icon="heroicons:arrow-left"
        label="На главную"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  useSeo({
    title: 'Запрос на обработку персональных данных',
    description:
      'Страница для подачи запросов субъекта персональных данных. Сейчас в разработке — пишите на kalashnikova199979@gmail.com.',
    image: '/logo.png',
  })

  onMounted(() => {
    scrollTo(0, 0)
  })
</script>
