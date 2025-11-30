<template>
  <div class="flex justify-center">
    <UAccordion type="multiple" :items="items">
      <template #content>
        <div class="p-6 space-y-10">
          <!-- Описание -->
          <section class="space-y-3">
            <h3
              class="text-lg font-semibold text-neutral-900
                dark:text-neutral-100"
            >
              О разделе
            </h3>
            <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              В разделе собраны авторские работы: картины, картины в оформлении,
              наброски, постеры, открытки и стикеры.
            </p>
          </section>

          <!-- Блок-карточка -->
          <section
            class="rounded-xl border border-neutral-200 dark:border-neutral-700
              p-5 bg-neutral-50/60 dark:bg-neutral-900/40"
          >
            <h3
              class="text-lg font-semibold mb-4 text-neutral-900
                dark:text-neutral-100"
            >
              Картины
            </h3>

            <ul class="space-y-2">
              <li class="flex gap-3 text-neutral-700 dark:text-neutral-400">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Оригинальные акварельные этюды и длительные рисунки на бумаге
              </li>
              <li class="flex gap-3 text-neutral-700 dark:text-neutral-400">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Продаются без оформления
              </li>
              <li class="flex gap-3 text-neutral-700 dark:text-neutral-400">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Спереди указаны фамилия автора и год создания
              </li>
              <li class="flex gap-3 text-neutral-700 dark:text-neutral-400">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                На обороте - полная подпись: ФИО, название работы, материалы,
                размер, год
              </li>
              <li class="flex gap-3 text-neutral-700 dark:text-neutral-400">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                У большинства акварелей есть небольшая белая рамка по краю
              </li>
              <li class="flex gap-3 text-neutral-700 dark:text-neutral-400">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Каждая работа уникальна - акварель невозможно точно повторить
              </li>
            </ul>

            <div
              class="mt-5 rounded-lg p-4 bg-white dark:bg-neutral-800 border
                border-neutral-200 dark:border-neutral-700"
            >
              <h4
                class="font-medium mb-2 text-neutral-800 dark:text-neutral-300"
              >
                Дополнительные услуги
              </h4>

              <ul class="space-y-2">
                <li class="flex gap-3 text-neutral-700 dark:text-neutral-400">
                  <span
                    class="w-1.5 h-1.5 mt-2 rounded-full bg-neutral-500"
                  ></span>
                  Дополнительные фотографии и видео по запросу
                </li>
                <li class="flex gap-3 text-neutral-700 dark:text-neutral-400">
                  <span
                    class="w-1.5 h-1.5 mt-2 rounded-full bg-neutral-500"
                  ></span>
                  Помощь в оформлении: рамы, паспарту, консультации, передача в
                  багетную мастерскую
                </li>
              </ul>
            </div>
          </section>

          <!-- Картины в оформлении -->
          <section class="space-y-3">
            <h3
              class="text-lg font-semibold text-neutral-900
                dark:text-neutral-100"
            >
              Картины в оформлении
            </h3>

            <ul class="space-y-2 text-neutral-700 dark:text-neutral-400">
              <li class="flex gap-3">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Акварели и наброски, уже оформленные в раму или паспарту
              </li>
              <li class="flex gap-3">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Возможность заказать дополнительное оформление
              </li>
              <li class="flex gap-3">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Тщательная упаковка с дополнительной защитой
              </li>
              <li class="flex gap-3">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Дополнительные фото и видео для выбора подходящей работы
              </li>
            </ul>
          </section>

          <!-- Наброски -->
          <section class="space-y-3">
            <h3
              class="text-lg font-semibold text-neutral-900
                dark:text-neutral-100"
            >
              Наброски
            </h3>

            <ul class="space-y-2 text-neutral-700 dark:text-neutral-400">
              <li class="flex gap-3">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Графические рисунки в разных стилях и оттенках
              </li>
              <li class="flex gap-3">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Темы: ню, анималистика, портрет, пейзаж, натюрморт
              </li>
              <li class="flex gap-3">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Каждый набросок - в единственном экземпляре
              </li>
              <li class="flex gap-3">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Дополнительные фото/видео по запросу
              </li>
            </ul>
          </section>

          <!-- Постеры -->
          <section class="space-y-3">
            <h3
              class="text-lg font-semibold text-neutral-900
                dark:text-neutral-100"
            >
              Постеры
            </h3>

            <ul class="space-y-2 text-neutral-700 dark:text-neutral-400">
              <li class="flex gap-3">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Печать на фотобумаге
              </li>
              <li class="flex gap-3">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Бюджетный вариант при сохранении высокого качества
              </li>
              <li class="flex gap-3">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Каждый постер подписан и имеет нумерацию
              </li>
              <li class="flex gap-3">
                <span class="w-2 h-2 mt-2 rounded-full bg-neutral-400"></span>
                Дополнительные фото/видео по запросу
              </li>
            </ul>
          </section>

          <!-- Открытки и стикеры -->
          <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <h3
                class="text-lg font-semibold text-neutral-900
                  dark:text-neutral-100"
              >
                Открытки
              </h3>
              <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Печатные уменьшенные копии акварельных работ
              </p>
            </div>

            <div class="space-y-2">
              <h3
                class="text-lg font-semibold text-neutral-900
                  dark:text-neutral-100"
              >
                Стикеры
              </h3>
              <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Уникальные наклейки с элементами акварельных работ
              </p>
            </div>
          </section>
        </div>
      </template>
    </UAccordion>
  </div>
</template>

<script setup lang="ts">
  import type { AccordionItem } from '@nuxt/ui'

  const items: AccordionItem[] = [
    {
      label: 'Важная информация',
      icon: 'heroicons:information-circle',
    },
  ]
</script>
