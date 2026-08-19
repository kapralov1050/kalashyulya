<template>
  <Transition name="cookie-banner">
    <div
      v-if="!hasMadeChoice()"
      class="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4"
      role="dialog"
      aria-live="polite"
      aria-label="Уведомление об использовании cookies"
    >
      <UCard
        class="max-w-3xl mx-auto shadow-lg ring-1 ring-neutral-200
          dark:ring-neutral-700"
        :ui="{
          root: 'bg-white dark:bg-neutral-900',
          body: 'p-4 sm:p-5',
        }"
      >
        <div class="flex items-start gap-3">
          <div class="flex-1 min-w-0">
            <p
              class="text-xs leading-relaxed text-neutral-700
                dark:text-neutral-300 sm:text-sm"
            >
              Мы используем cookies для работы сайта. Продолжая использовать
              сайт, вы соглашаетесь с этим.
              <NuxtLink
                to="/privacy"
                class="text-primary-500 hover:underline"
                target="_blank"
              >
                Подробнее
              </NuxtLink>.
            </p>

            <div
              class="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2"
            >
              <UButton
                color="primary"
                size="sm"
                block
                class="sm:order-1 sm:w-auto"
                @click="acceptAll"
              >
                Принять
              </UButton>
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                block
                class="sm:order-2 sm:w-auto"
                @click="acceptNecessary"
              >
                Только необходимые
              </UButton>
            </div>
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="heroicons:x-mark"
            square
            class="-mt-1 -mr-1 shrink-0"
            aria-label="Закрыть"
            @click="acceptAll"
          />
        </div>
      </UCard>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { hasMadeChoice, acceptAll, acceptNecessary } = useCookieConsent()
</script>

<style scoped>
.cookie-banner-enter-active,
.cookie-banner-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.cookie-banner-enter-from,
.cookie-banner-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}
</style>
