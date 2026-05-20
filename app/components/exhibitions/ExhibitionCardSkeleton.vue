<template>
  <div
    class="animate-pulse overflow-hidden rounded-2xl border border-neutral-200
      bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
  >
    <!-- Картинка 4/3 -->
    <div class="aspect-[4/3] w-full bg-neutral-200 dark:bg-neutral-800" />

    <!-- Текст -->
    <div class="flex flex-col gap-3 px-5 py-4">
      <!-- Заголовок -->
      <div class="space-y-2">
        <div class="h-4 w-4/5 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div class="h-4 w-3/5 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <!-- Дата -->
      <div class="h-3 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700" />
      <!-- Описание -->
      <div class="space-y-1.5">
        <div class="h-3 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        <div class="h-3 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        <div class="h-3 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
    </div>
  </div>
</template>
