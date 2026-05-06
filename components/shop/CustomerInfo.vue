<template>
  <div class="p-6 space-y-12 w-full max-w-3xl mx-auto">
    <!-- Заголовок раздела -->
    <section class="space-y-4">
      <h3 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {{ printLocale('shop_info_welcome_title') }}
      </h3>
      <p class="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
        {{ printLocale('shop_info_welcome_text') }}
      </p>
    </section>

    <!-- Картины -->
    <section
      class="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900
        dark:to-neutral-800 rounded-2xl p-8 shadow-sm border border-neutral-200
        dark:border-neutral-700"
    >
      <div class="flex items-center gap-3 mb-6">
        <h3 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {{ printLocale('shop_info_pictures_title') }}
        </h3>
      </div>

      <div class="space-y-6">
        <div class="space-y-4">
          <p class="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {{ printLocale('shop_info_pictures_desc') }}
          </p>

          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-amber-400 mt-2.5 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ printLocale('shop_info_pictures_point1') }}
              </span>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-amber-400 mt-2.5 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ printLocale('shop_info_pictures_point2') }}
              </span>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-amber-400 mt-2.5 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ printLocale('shop_info_pictures_point3') }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Дополнительные услуги -->
        <div
          class="bg-white/50 dark:bg-neutral-800/50 rounded-xl p-6 border
            border-neutral-200 dark:border-neutral-700"
        >
          <h4 class="font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
            {{ printLocale('shop_info_help_title') }}
          </h4>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-neutral-500 mt-2 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ printLocale('shop_info_help_point1') }}
              </span>
            </div>
            <div class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-neutral-500 mt-2 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ printLocale('shop_info_help_point2') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Другие работы - сетка -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Картины в оформлении -->
      <div
        class="bg-white/50 dark:bg-neutral-900/30 rounded-xl p-6 border
          border-neutral-200 dark:border-neutral-700"
      >
        <h4
          class="text-lg font-semibold mb-4 text-neutral-900
            dark:text-neutral-100"
        >
          {{ printLocale('shop_info_framed_title') }}
        </h4>
        <p class="text-neutral-700 dark:text-neutral-300 mb-4">
          {{ printLocale('shop_info_framed_desc') }}
        </p>
        <ul class="space-y-2.5">
          <li class="flex items-start gap-2">
            <div
              class="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"
            ></div>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              {{ printLocale('shop_info_framed_point1') }}
            </span>
          </li>
          <li class="flex items-start gap-2">
            <div
              class="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"
            ></div>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              {{ printLocale('shop_info_framed_point2') }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Наброски -->
      <div
        class="bg-white/50 dark:bg-neutral-900/30 rounded-xl p-6 border
          border-neutral-200 dark:border-neutral-700"
      >
        <h4
          class="text-lg font-semibold mb-4 text-neutral-900
            dark:text-neutral-100"
        >
          {{ printLocale('shop_info_sketches_title') }}
        </h4>
        <p class="text-neutral-700 dark:text-neutral-300 mb-4">
          {{ printLocale('shop_info_sketches_desc') }}
        </p>
        <ul class="space-y-2.5">
          <li class="flex items-start gap-2">
            <div
              class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"
            ></div>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              {{ printLocale('shop_info_sketches_point1') }}
            </span>
          </li>
          <li class="flex items-start gap-2">
            <div
              class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"
            ></div>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              {{ printLocale('shop_info_sketches_point2') }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Постеры -->
      <div
        class="bg-white/50 dark:bg-neutral-900/30 rounded-xl p-6 border
          border-neutral-200 dark:border-neutral-700"
      >
        <h4
          class="text-lg font-semibold mb-4 text-neutral-900
            dark:text-neutral-100"
        >
          {{ printLocale('shop_info_posters_title') }}
        </h4>
        <p class="text-neutral-700 dark:text-neutral-300 mb-4">
          {{ printLocale('shop_info_posters_desc') }}
        </p>
        <ul class="space-y-2.5">
          <li class="flex items-start gap-2">
            <div
              class="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"
            ></div>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              {{ printLocale('shop_info_posters_point1') }}
            </span>
          </li>
          <li class="flex items-start gap-2">
            <div
              class="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"
            ></div>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              {{ printLocale('shop_info_posters_point2') }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Открытки и стикеры -->
      <div
        class="bg-white/50 dark:bg-neutral-900/30 rounded-xl p-6 border
          border-neutral-200 dark:border-neutral-700"
      >
        <h4
          class="text-lg font-semibold mb-4 text-neutral-900
            dark:text-neutral-100"
        >
          {{ printLocale('shop_info_postcards_title') }}
        </h4>
        <p class="text-neutral-700 dark:text-neutral-300 mb-4">
          {{ printLocale('shop_info_postcards_desc') }}
        </p>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <h5 class="font-medium text-neutral-800 dark:text-neutral-200">
              {{ printLocale('shop_info_postcards_subtitle') }}
            </h5>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              {{ printLocale('shop_info_postcards_sub_desc') }}
            </p>
          </div>
          <div class="space-y-2">
            <h5 class="font-medium text-neutral-800 dark:text-neutral-200">
              {{ printLocale('shop_info_stickers_subtitle') }}
            </h5>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              {{ printLocale('shop_info_stickers_sub_desc') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Оплата и доставка -->
    <section
      class="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900
        dark:to-neutral-800 rounded-2xl p-8 shadow-sm border border-neutral-200
        dark:border-neutral-700"
    >
      <div class="flex items-center gap-3 mb-6">
        <UIcon
          name="i-heroicons-credit-card"
          class="w-6 h-6 text-neutral-700 dark:text-neutral-300"
        />
        <h3 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {{ printLocale('shop_info_payment_title') }}
        </h3>
      </div>

      <div class="space-y-6">
        <!-- Оплата -->
        <div class="space-y-4">
          <h4
            class="font-semibold text-lg text-neutral-800 dark:text-neutral-200"
          >
            {{ printLocale('shop_info_payment_methods_title') }}
          </h4>
          <p class="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {{ printLocale('shop_info_payment_methods_desc') }}
          </p>

          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-green-500 mt-2.5 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ printLocale('shop_info_payment_point1') }}
              </span>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-green-500 mt-2.5 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ printLocale('shop_info_payment_point2') }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Доставка -->
        <div class="space-y-4">
          <h4
            class="font-semibold text-lg text-neutral-800 dark:text-neutral-200"
          >
            {{ printLocale('shop_info_delivery_title') }}
          </h4>

          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-blue-500 mt-2.5 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ printLocale('shop_info_delivery_point1') }}
              </span>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-blue-500 mt-2.5 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ printLocale('shop_info_delivery_point2') }}
              </span>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-blue-500 mt-2.5 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                {{ printLocale('shop_info_delivery_point3') }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Призыв к действию -->
    <section class="text-center py-8">
      <p class="text-neutral-700 dark:text-neutral-300">
        {{ printLocale('shop_info_cta') }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
  const { printLocale } = useLocales()
</script>
