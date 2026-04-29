<template>
  <div class="container flex flex-col items-center justify-center mb-20">
    <div class="w-full max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1
          class="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white
            mb-4"
        >
          {{ printLocale('requisites_title') }}
        </h1>
        <p class="text-neutral-600 dark:text-neutral-400 text-lg">
          {{ printLocale('requisites_subtitle') }}
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
                {{ printLocale('requisites_seller_title') }}
              </h2>
            </div>
            <div class="space-y-3">
              <div>
                <p
                  class="text-xs text-neutral-500 dark:text-neutral-400
                    uppercase tracking-wide mb-1"
                >
                  {{ printLocale('requisites_name_field') }}
                </p>
                <p class="text-neutral-800 dark:text-neutral-200 font-medium">
                  {{ printLocale('requisites_seller_name') }}
                </p>
              </div>
              <div>
                <p
                  class="text-xs text-neutral-500 dark:text-neutral-400
                    uppercase tracking-wide mb-1"
                >
                  {{ printLocale('requisites_status_field') }}
                </p>
                <p class="text-neutral-800 dark:text-neutral-200 font-medium">
                  {{ printLocale('requisites_seller_status') }}
                </p>
              </div>
              <div>
                <p
                  class="text-xs text-neutral-500 dark:text-neutral-400
                    uppercase tracking-wide mb-1"
                >
                  {{ printLocale('requisites_inn_field') }}
                </p>
                <p
                  class="text-neutral-800 dark:text-neutral-200 font-medium
                    font-mono"
                >
                  {{ printLocale('requisites_seller_inn') }}
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
                {{ printLocale('requisites_contacts_title') }}
              </h2>
            </div>
            <div class="space-y-3">
              <div>
                <p
                  class="text-xs text-neutral-500 dark:text-neutral-400
                    uppercase tracking-wide mb-1"
                >
                  {{ printLocale('requisites_email_field') }}
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
                  {{ printLocale('requisites_phone_field') }}
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
          {{ printLocale('requisites_pseudonym_notice') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const { printLocale } = useLocales()

  onMounted(() => {
    scrollTo(0, 0)
  })

  onMounted(async () => {
    metrics.trackPageView('requisites')
  })
</script>
