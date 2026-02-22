<template>
  <div class="container flex flex-col items-center justify-center mb-20">
    <div class="w-full max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1
          class="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white
            mb-4"
        >
          Реквизиты
        </h1>
        <p class="text-neutral-600 dark:text-neutral-400 text-lg">
          Информация о продавце
        </p>
      </div>

      <!-- Cards Grid -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Seller Info Card -->
        <div
          class="dark:border-neutral-700 dark:bg-neutral-800/60 bg-white
            rounded-xl shadow-md overflow-hidden"
        >
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <h2
                class="text-xl font-semibold text-neutral-900 dark:text-white"
              >
                Продавец
              </h2>
            </div>
            <div class="space-y-3">
              <div>
                <p
                  class="text-xs text-neutral-500 dark:text-neutral-400
                    uppercase tracking-wide mb-1"
                >
                  Имя
                </p>
                <p class="text-neutral-800 dark:text-neutral-200 font-medium">
                  Юлия Капралова
                </p>
              </div>
              <div>
                <p
                  class="text-xs text-neutral-500 dark:text-neutral-400
                    uppercase tracking-wide mb-1"
                >
                  Статус
                </p>
                <p class="text-neutral-800 dark:text-neutral-200 font-medium">
                  Самозанятая (Налог на профессиональный доход)
                </p>
              </div>
              <div>
                <p
                  class="text-xs text-neutral-500 dark:text-neutral-400
                    uppercase tracking-wide mb-1"
                >
                  ИНН
                </p>
                <p
                  class="text-neutral-800 dark:text-neutral-200 font-medium
                    font-mono"
                >
                  370605819158
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contacts Card -->
        <div
          class="dark:border-neutral-700 dark:bg-neutral-800/60 bg-white
            rounded-xl shadow-md overflow-hidden"
        >
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <h2
                class="text-xl font-semibold text-neutral-900 dark:text-white"
              >
                Контакты
              </h2>
            </div>
            <div class="space-y-3">
              <div>
                <p
                  class="text-xs text-neutral-500 dark:text-neutral-400
                    uppercase tracking-wide mb-1"
                >
                  Email
                </p>
                <a
                  href="mailto:kalashnikova199979@gmail.com"
                  class="text-neutral-800 dark:text-neutral-200 font-medium
                    hover:text-blue-600 dark:hover:text-blue-400
                    transition-colors duration-200"
                >
                  kalashnikova199979@gmail.com
                </a>
              </div>
              <div>
                <p
                  class="text-xs text-neutral-500 dark:text-neutral-400
                    uppercase tracking-wide mb-1"
                >
                  Телефон
                </p>
                <a
                  href="tel:+79106868111"
                  class="text-neutral-800 dark:text-neutral-200 font-medium
                    hover:text-blue-600 dark:hover:text-blue-400
                    transition-colors duration-200"
                >
                  +7 (910)-68-68-111
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pseudonym Notice -->
      <div class="mt-8 text-center">
        <p class="text-neutral-600 dark:text-neutral-400 text-base">
          Калашникова Юлия (kalashyulya) является творческим псевдонимом Капраловой Юлии
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  onMounted(() => {
    scrollTo(0, 0)
  })

  onMounted(async () => {
    metrics.trackPageView('requisites')
  })
</script>
