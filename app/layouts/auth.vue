<template>
  <UApp>
    <main class="grid min-h-screen place-items-center dark:bg-neutral-800">
      <section class="flex w-full flex-col items-center gap-y-4 p-3 sm:gap-y-6">
        <AppLogo
          icon-classes="size-14 text-primary-600 sm:size-16 dark:text-white"
        />
        <div
          class="w-full rounded-md border border-gray-200 bg-white p-4 shadow-sm
            sm:w-96 sm:rounded-lg sm:p-6 dark:border-black dark:bg-neutral-900
            dark:shadow-none"
        >
          <slot />
        </div>
      </section>
    </main>
  </UApp>
</template>
