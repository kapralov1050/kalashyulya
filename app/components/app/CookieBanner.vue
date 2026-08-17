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
              Сайт использует технические cookies (Firebase) для работы корзины и
              входа в админку. Продолжая использовать сайт, вы соглашаетесь с их
              использованием. Подробнее — в
              <NuxtLink
                to="/privacy"
                class="text-primary-500 hover:underline"
                target="_blank"
              >
                Политике обработки персональных данных
              </NuxtLink>.
            </p>

            <div
              v-if="settingsOpen"
              class="mt-3 rounded-md bg-neutral-50 p-3 text-xs
                text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300
                sm:text-sm"
            >
              <p class="font-medium mb-2">Используемые cookies и SDK:</p>
              <ul class="list-disc pl-5 space-y-1">
                <li>
                  <strong>Firebase Authentication</strong> — техническая сессия
                  администратора, хранится в IndexedDB браузера.
                </li>
                <li>
                  <strong>localStorage</strong> — корзина, согласия, настройки
                  интерфейса (без передачи третьим лицам).
                </li>
                <li>
                  Аналитические и рекламные cookies не используются.
                </li>
              </ul>
            </div>

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
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                block
                class="sm:order-3 sm:w-auto"
                @click="settingsOpen = !settingsOpen"
              >
                {{ settingsOpen ? 'Скрыть' : 'Настройки' }}
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

const settingsOpen = ref(false)
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
