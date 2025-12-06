<template>
  <div class="p-6 space-y-12 w-full max-w-3xl mx-auto">
    <!-- Заголовок раздела -->
    <section class="space-y-4">
      <h3 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Добро пожаловать в мой магазин!
      </h3>
      <p class="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
        Здесь собраны мои авторские работы: от оригинальных картин до печатной
        продукции. Каждая работа создана с любовью и вниманием к деталям.
      </p>
    </section>

    <!-- Картины -->
    <section
      class="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900
        dark:to-neutral-800 rounded-2xl p-8 shadow-sm border border-neutral-200
        dark:border-neutral-700"
    >
      <div class="flex items-center gap-3 mb-6">
        <div class="w-3 h-8 bg-amber-500 rounded-full"></div>
        <h3 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Картины
        </h3>
      </div>

      <div class="space-y-6">
        <div class="space-y-4">
          <p class="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Оригинальные акварельные работы, которые существуют в единственном
            экземпляре. Акварель невозможно повторить точно, поэтому каждая
            картина уникальна.
          </p>

          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-amber-400 mt-2.5 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                Работы продаются без оформления
              </span>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-amber-400 mt-2.5 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                Спереди указаны автор и год создания
              </span>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-amber-400 mt-2.5 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                На обороте — полная информация о работе
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
            Чем могу помочь
          </h4>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-neutral-500 mt-2 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                Дополнительные фото и видео работы по вашему запросу
              </span>
            </div>
            <div class="flex items-start gap-3">
              <div
                class="w-2 h-2 rounded-full bg-neutral-500 mt-2 flex-shrink-0"
              ></div>
              <span class="text-neutral-700 dark:text-neutral-300">
                Помогу с оформлением: подберу раму, паспарту или передам в
                багетную мастерскую
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
          Картины в оформлении
        </h4>
        <p class="text-neutral-700 dark:text-neutral-300 mb-4">
          Готовые к размещению работы уже в раме или паспарту.
        </p>
        <ul class="space-y-2.5">
          <li class="flex items-start gap-2">
            <div
              class="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"
            ></div>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              Можно заказать дополнительное оформление
            </span>
          </li>
          <li class="flex items-start gap-2">
            <div
              class="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"
            ></div>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              Тщательная упаковка с защитой стекла
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
          Наброски
        </h4>
        <p class="text-neutral-700 dark:text-neutral-300 mb-4">
          Графические рисунки в разных стилях — каждый уникален.
        </p>
        <ul class="space-y-2.5">
          <li class="flex items-start gap-2">
            <div
              class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"
            ></div>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              Темы: от портретов до пейзажей
            </span>
          </li>
          <li class="flex items-start gap-2">
            <div
              class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"
            ></div>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              Существуют в единственном экземпляре
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
          Постеры
        </h4>
        <p class="text-neutral-700 dark:text-neutral-300 mb-4">
          Печать на качественной бумаге — доступный вариант с авторской
          подписью.
        </p>
        <ul class="space-y-2.5">
          <li class="flex items-start gap-2">
            <div
              class="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"
            ></div>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              Высокое качество печати
            </span>
          </li>
          <li class="flex items-start gap-2">
            <div
              class="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"
            ></div>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              Каждый постер пронумерован и подписан
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
          Открытки и стикеры
        </h4>
        <p class="text-neutral-700 dark:text-neutral-300 mb-4">
          Небольшие приятные вещицы с элементами моих работ.
        </p>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <h5 class="font-medium text-neutral-800 dark:text-neutral-200">
              Открытки
            </h5>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              Печатные миниатюры акварельных работ
            </p>
          </div>
          <div class="space-y-2">
            <h5 class="font-medium text-neutral-800 dark:text-neutral-200">
              Стикеры
            </h5>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              Наклейки с элементами акварелей
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Призыв к действию -->
    <section class="text-center py-8">
      <p class="text-neutral-700 dark:text-neutral-300">
        Если у вас есть вопросы или нужны дополнительные фотографии — просто
        напишите, с радостью помогу с выбором!
      </p>
    </section>
  </div>
</template>

<script setup lang="ts"></script>
