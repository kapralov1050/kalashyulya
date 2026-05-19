<template>
  <UApp>
    <div class="min-h-screen flex bg-white dark:bg-neutral-900">

      <!-- LEFT: sticky contextual image / map -->
      <div class="hidden lg:block w-[58%] relative shrink-0">
        <div class="sticky top-0 h-screen overflow-hidden">
          <Transition name="step-image" mode="out-in">

            <!-- Шаг 0: Аватар главный + маленькая иллюстрация + таймлайн -->
            <div
              v-if="currentStep === 0"
              key="artist"
              class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 px-12 py-12 gap-8"
            >
              <!-- Аватар + приветствие -->
              <div class="flex flex-col items-center text-center">
                <div class="relative">
                  <img
                    src="/timeline/1.webp"
                    alt="Юля Калашникова"
                    class="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-neutral-900 shadow-xl"
                  />
                  <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-neutral-900 flex items-center justify-center">
                    <UIcon name="heroicons:check-16-solid" class="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <h3 class="text-2xl font-bold text-neutral-900 dark:text-white mt-4">
                  Меня зовут Юля
                </h3>
                <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed max-w-xs">
                  Я лично свяжусь с вами в течение часа, чтобы согласовать детали заказа
                </p>
              </div>

              <!-- Все иллюстрации в линию -->
              <div class="w-full">
                <p class="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 text-center mb-4">
                  Как происходит покупка
                </p>
                <div class="flex gap-2">
                  <button
                    v-for="(s, i) in timelineSteps"
                    :key="i"
                    class="flex-1 rounded-xl overflow-hidden transition-all duration-500 border-2"
                    :class="i === activeTimelineStep
                      ? 'border-primary-500 shadow-md scale-105'
                      : 'border-transparent opacity-50 hover:opacity-75'"
                    @click="activeTimelineStep = i"
                  >
                    <img
                      :src="`/delivery-explanations/${i + 1}.jpg`"
                      :alt="s.title"
                      class="w-full aspect-square object-cover"
                    />
                  </button>
                </div>
              </div>

              <!-- Таймлайн-навигация -->
              <div class="w-full">
                <div class="relative flex justify-between items-start">
                  <div class="absolute top-4 left-[10%] right-[10%] h-0.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      class="h-full min-w-2 bg-primary-500 transition-all duration-700 ease-out rounded-full"
                      :style="{ width: `${(activeTimelineStep / (timelineSteps.length - 1)) * 100}%` }"
                    />
                  </div>
                  <button
                    v-for="(s, i) in timelineSteps"
                    :key="i"
                    class="relative flex flex-col items-center w-1/5 transition-all duration-500"
                    :class="i <= activeTimelineStep ? 'opacity-100' : 'opacity-35'"
                    @click="activeTimelineStep = i"
                  >
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500"
                      :class="i === activeTimelineStep
                        ? 'bg-primary-500 border-primary-500 text-white scale-110 shadow-[0_0_0_4px_rgba(6,182,212,0.15)]'
                        : i < activeTimelineStep
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-400'"
                    >
                      <UIcon :name="s.icon" class="w-4 h-4" />
                    </div>
                    <p class="text-[10px] font-semibold mt-2 text-center text-neutral-600 dark:text-neutral-300 leading-tight">
                      {{ s.title }}
                    </p>
                    <Transition name="slide-up">
                      <p
                        v-if="i === activeTimelineStep"
                        class="text-[10px] text-center text-primary-500 mt-0.5 leading-tight max-w-16"
                      >
                        {{ s.caption }}
                      </p>
                    </Transition>
                  </button>
                </div>
              </div>

              <!-- Бейдж защиты -->
              <div class="flex items-center gap-2 text-xs text-neutral-400">
                <UIcon name="heroicons:shield-check" class="w-3.5 h-3.5 text-emerald-500" />
                <span>Ваши данные защищены</span>
              </div>
            </div>

            <!-- Шаг 1 + Самовывоз: карта России с маркером СПб -->
            <div
              v-else-if="currentStep === 1 && form.deliveryType === 'pickup'"
              key="pickup-map"
              class="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-neutral-900 px-14 py-16 gap-8"
            >
              <p class="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400">
                Самовывоз
              </p>
              <div class="w-full" style="height: 52%">
                <ShopPickupMapPreview />
              </div>
              <div class="text-center">
                <h3 class="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                  Встреча в Санкт-Петербурге
                </h3>
                <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  Согласуем время и место при оформлении заказа
                </p>
              </div>
            </div>

            <!-- Шаг 1 + Доставка СДЭК: карта с зонами -->
            <div
              v-else-if="currentStep === 1 && form.deliveryType === 'delivery'"
              key="delivery-map"
              class="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-neutral-900 px-14 py-16 gap-6"
            >
              <p class="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400">
                Доставка СДЭК · По России до ПВЗ
              </p>
              <div class="w-full" style="height: 52%">
                <ShopDeliveryZoneMap :zone="currentZone" :city-name="selectedCity" />
              </div>
              <Transition name="slide-up" mode="out-in">
                <div
                  :key="currentZone ?? 'empty'"
                  class="text-center"
                >
                  <template v-if="currentZone">
                    <h3 class="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                      {{ ZONE_CONFIG[currentZone].name }}
                    </h3>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                      {{ ZONE_CONFIG[currentZone].examples }}
                    </p>
                  </template>
                  <template v-else>
                    <h3 class="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                      Выберите город доставки
                    </h3>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                      Карта покажет зону и примерную стоимость
                    </p>
                  </template>
                </div>
              </Transition>
            </div>

            <!-- Шаг 2: Оформление — меняется под выбор опции -->
            <div
              v-else-if="currentStep === 2"
              :key="`framing-${form.framing || 'default'}`"
              class="w-full h-full flex items-center justify-center bg-white dark:bg-neutral-800 p-10"
            >
              <img
                :src="framingImageSrc"
                :alt="framingImageAlt"
                class="max-w-full max-h-full object-contain"
              />
            </div>

            <!-- Шаг 3: Превью корзины + бейдж оформления -->
            <div
              v-else-if="currentStep === 3"
              key="summary-preview"
              class="w-full h-full flex flex-col bg-neutral-50 dark:bg-neutral-800 px-14 py-16 overflow-y-auto"
            >
              <p class="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">
                Ваш заказ
              </p>
              <h3 class="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
                Ещё раз взгляните
              </h3>

              <div class="grid gap-4" :class="shoppingCart.length === 1 ? 'grid-cols-1' : 'grid-cols-2'">
                <div
                  v-for="el in shoppingCart"
                  :key="el.item.id"
                  class="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm"
                >
                  <div class="aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      :src="el.item.image[0]"
                      :alt="el.item.title"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="p-4">
                    <p class="font-semibold text-sm dark:text-white truncate">{{ el.item.title }}</p>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-xs text-neutral-500">{{ el.amount }} шт.</p>
                      <p class="text-sm font-bold text-primary-600">₽{{ el.item.price * el.amount }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Бейдж выбранного оформления -->
              <div
                class="mt-6 flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm"
              >
                <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center shrink-0">
                  <UIcon
                    :name="framingOptions.find(o => o.value === form.framing)?.icon || 'heroicons:photo'"
                    class="w-6 h-6 text-primary-600"
                  />
                </div>
                <div class="flex-1">
                  <p class="text-xs font-semibold tracking-widest uppercase text-neutral-400">В оформлении</p>
                  <p class="font-semibold text-neutral-900 dark:text-white mt-0.5">
                    {{ framingOptions.find(o => o.value === form.framing)?.title || 'Не выбрано' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Шаг 4: Trust signals для оплаты -->
            <div
              v-else-if="currentStep === 4"
              key="payment-trust"
              class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 px-14 py-16"
            >
              <div class="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-6">
                <UIcon name="heroicons:lock-closed" class="w-10 h-10 text-emerald-600" />
              </div>
              <p class="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">
                Безопасный платёж
              </p>
              <h3 class="text-3xl font-bold text-neutral-900 dark:text-white mb-3 text-center">
                Защищённая оплата
              </h3>
              <p class="text-neutral-500 dark:text-neutral-400 text-center max-w-md leading-relaxed">
                Данные карты обрабатываются банком напрямую — мы не видим и не сохраняем их у себя
              </p>

              <!-- Логотипы платёжных систем -->
              <div class="flex items-center gap-3 mt-10 flex-wrap justify-center">
                <div
                  v-for="m in paymentMethods"
                  :key="m"
                  class="px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm text-sm font-bold text-neutral-700 dark:text-neutral-300 min-w-20 text-center"
                >
                  {{ m }}
                </div>
              </div>

              <!-- ЮKassa бейдж -->
              <div class="mt-6 flex items-center gap-2 text-sm text-neutral-500">
                <UIcon name="heroicons:shield-check" class="w-4 h-4 text-emerald-500" />
                <span>Платёжный сервис ЮKassa · сертифицирован PCI DSS</span>
              </div>

              <!-- Возврат -->
              <div class="mt-10 max-w-md p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                <div class="flex items-start gap-3">
                  <UIcon name="heroicons:arrow-path" class="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <p class="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Что если не подойдёт?</p>
                    <p class="text-xs text-neutral-500 mt-1 leading-relaxed">
                      Возврат в течение 7 дней — мы согласуем все детали индивидуально
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- RIGHT: form + vertical stepper -->
      <div class="flex-1 flex min-h-screen">

        <!-- Form content -->
        <div class="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-14 py-16 max-w-lg">

          <div class="flex items-center justify-between mb-10">
            <NuxtLink
              to="/basket"
              class="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700
                dark:hover:text-neutral-200 transition-colors w-fit group"
            >
              <UIcon
                name="heroicons:arrow-left-16-solid"
                class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
              />
              Корзина
            </NuxtLink>

            <!-- Dev: быстрый переход по шагам -->
            <div class="flex gap-1">
              <button
                v-for="(_step, i) in steps"
                :key="i"
                class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                :class="currentStep === i
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'"
                @click="currentStep = i"
              >
                {{ i + 1 }}
              </button>
            </div>
          </div>

          <Transition name="slide-up" mode="out-in">
            <p
              :key="`label-${currentStep}`"
              class="text-xs font-bold tracking-[0.2em] uppercase text-primary-500 mb-2"
            >
              {{ steps[currentStep].label }}
            </p>
          </Transition>

          <Transition name="slide-up" mode="out-in">
            <div :key="`heading-${currentStep}`" class="mb-8">
              <h1 class="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white leading-tight mb-2">
                {{ steps[currentStep].title }}
              </h1>
              <p class="text-neutral-500 dark:text-neutral-400 text-sm">
                {{ steps[currentStep].description }}
              </p>
            </div>
          </Transition>

          <!-- ── STEP 0: Контакты ── -->
          <Transition name="slide-up" mode="out-in">
            <div :key="`form-${currentStep}`">
              <div v-if="currentStep === 0" class="space-y-5">
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Имя</label>
                  <UInput
                    v-model="form.name"
                    size="xl"
                    placeholder="Иван Иванов"
                    class="w-full"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Email</label>
                  <UInput
                    v-model="form.email"
                    size="xl"
                    type="email"
                    placeholder="ivan@mail.ru"
                    class="w-full"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    Способ связи
                  </label>
                  <div class="flex gap-2">
                    <button
                      v-for="m in messengerOptions"
                      :key="m.value"
                      class="flex-1 py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all"
                      :class="form.messengers.includes(m.value)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400'"
                      @click="toggleMessenger(m.value)"
                    >
                      {{ m.label }}
                    </button>
                  </div>
                </div>
                <Transition name="slide-up">
                  <div v-if="form.messengers.includes('phone')" class="space-y-1.5">
                    <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Телефон</label>
                    <UInput
                      v-model="form.phone"
                      size="xl"
                      placeholder="+7 999 999-99-99"
                      class="w-full"
                    />
                  </div>
                </Transition>
                <Transition name="slide-up">
                  <div v-if="form.messengers.some(m => ['vk', 'tg'].includes(m))" class="space-y-1.5">
                    <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Никнейм</label>
                    <UInput
                      v-model="form.nickname"
                      size="xl"
                      placeholder="@username"
                      class="w-full"
                    />
                  </div>
                </Transition>
              </div>

              <!-- ── STEP 1: Доставка ── -->
              <div v-else-if="currentStep === 1" class="space-y-5">
                <div class="grid grid-cols-2 gap-3">
                  <button
                    class="p-4 rounded-xl border-2 text-left transition-all"
                    :class="form.deliveryType === 'pickup'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'"
                    @click="form.deliveryType = 'pickup'"
                  >
                    <UIcon name="heroicons:building-storefront" class="w-6 h-6 mb-2 text-primary-500" />
                    <p class="font-semibold text-sm text-neutral-900 dark:text-white">Самовывоз</p>
                    <p class="text-xs text-neutral-500 mt-0.5">Бесплатно</p>
                  </button>
                  <button
                    class="p-4 rounded-xl border-2 text-left transition-all"
                    :class="form.deliveryType === 'delivery'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'"
                    @click="form.deliveryType = 'delivery'"
                  >
                    <UIcon name="heroicons:truck" class="w-6 h-6 mb-2 text-primary-500" />
                    <p class="font-semibold text-sm text-neutral-900 dark:text-white">Доставка СДЭК</p>
                    <p class="text-xs text-neutral-500 mt-0.5">По России, до ПВЗ</p>
                  </button>
                </div>

                <!-- Адресная форма (только для доставки) -->
                <Transition name="slide-up">
                  <div v-if="form.deliveryType === 'delivery'" class="space-y-4">
                    <div class="space-y-1.5">
                      <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Город</label>
                      <UInput
                        v-model="addressQuery"
                        size="xl"
                        placeholder="Начните вводить город..."
                        class="w-full"
                        @input="(e: Event) => fetchAddresses((e.target as HTMLInputElement).value)"
                      />
                      <div
                        v-if="suggestions.length"
                        class="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-lg"
                      >
                        <div
                          v-for="s in suggestions"
                          :key="s.value"
                          class="p-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer
                            border-b border-neutral-100 dark:border-neutral-800 last:border-0
                            text-neutral-700 dark:text-neutral-300"
                          @click="selectSuggestion(s)"
                        >
                          {{ s.value }}
                        </div>
                      </div>
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Получатель</label>
                      <UInput
                        v-model="form.recipient"
                        size="xl"
                        placeholder="Иванов Иван Иванович"
                        class="w-full"
                      />
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- ── STEP 2: Оформление ── -->
              <div v-else-if="currentStep === 2" class="space-y-3">
                <div
                  v-for="opt in framingOptions"
                  :key="opt.value"
                  class="flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all"
                  :class="form.framing === opt.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'"
                  @click="form.framing = opt.value as typeof form.framing"
                >
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
                    :class="form.framing === opt.value
                      ? 'bg-primary-100 dark:bg-primary-900'
                      : 'bg-neutral-100 dark:bg-neutral-800'"
                  >
                    <UIcon
                      :name="opt.icon"
                      class="w-5 h-5 transition-colors"
                      :class="form.framing === opt.value
                        ? 'text-primary-600'
                        : 'text-neutral-500 dark:text-neutral-400'"
                    />
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-neutral-900 dark:text-white">{{ opt.title }}</p>
                    <p class="text-sm text-neutral-500">{{ opt.description }}</p>
                  </div>
                  <div class="text-right shrink-0">
                    <p
                      v-if="opt.price"
                      class="font-semibold text-sm"
                      :class="form.framing === opt.value ? 'text-primary-600' : 'text-neutral-700 dark:text-neutral-300'"
                    >
                      от {{ opt.price.toLocaleString('ru') }} ₽
                    </p>
                    <p v-else class="text-sm text-neutral-400">Бесплатно</p>
                  </div>
                </div>
              </div>

              <!-- ── STEP 3: Summary ── -->
              <div v-else-if="currentStep === 3" class="space-y-3">

                <!-- Покупатель -->
                <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div class="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800">
                    <p class="text-xs font-bold tracking-widest uppercase text-neutral-400">Покупатель</p>
                    <button class="text-xs text-primary-500 hover:text-primary-600" @click="currentStep = 0">Изменить</button>
                  </div>
                  <div class="px-4 py-3 space-y-1.5 text-sm">
                    <div class="flex justify-between">
                      <span class="text-neutral-500">Имя</span>
                      <span class="font-medium dark:text-white">{{ form.name || '—' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-neutral-500">Email</span>
                      <span class="font-medium dark:text-white">{{ form.email || '—' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-neutral-500">Связь</span>
                      <span class="font-medium dark:text-white">
                        {{ form.messengers.map(m => ({ vk: 'ВКонтакте', tg: 'Телеграм', phone: 'Звонок' })[m]).join(', ') || '—' }}
                      </span>
                    </div>
                    <div v-if="form.phone" class="flex justify-between">
                      <span class="text-neutral-500">Телефон</span>
                      <span class="font-medium dark:text-white">{{ form.phone }}</span>
                    </div>
                    <div v-if="form.nickname" class="flex justify-between">
                      <span class="text-neutral-500">Никнейм</span>
                      <span class="font-medium dark:text-white">{{ form.nickname }}</span>
                    </div>
                  </div>
                </div>

                <!-- Доставка -->
                <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div class="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800">
                    <p class="text-xs font-bold tracking-widest uppercase text-neutral-400">Доставка</p>
                    <button class="text-xs text-primary-500 hover:text-primary-600" @click="currentStep = 1">Изменить</button>
                  </div>
                  <div class="px-4 py-3 space-y-1.5 text-sm">
                    <div class="flex justify-between">
                      <span class="text-neutral-500">Способ</span>
                      <span class="font-medium dark:text-white">{{ form.deliveryType === 'pickup' ? 'Самовывоз (СПб)' : 'СДЭК' }}</span>
                    </div>
                    <template v-if="form.deliveryType === 'delivery'">
                      <div v-if="form.address" class="flex justify-between">
                        <span class="text-neutral-500">Адрес</span>
                        <span class="font-medium dark:text-white text-right max-w-48">{{ form.address }}</span>
                      </div>
                      <div v-if="form.recipient" class="flex justify-between">
                        <span class="text-neutral-500">Получатель</span>
                        <span class="font-medium dark:text-white">{{ form.recipient }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-neutral-500">Стоимость</span>
                        <span class="font-medium dark:text-white">
                          <template v-if="currentZone && ZONE_CONFIG[currentZone].minPrice">от {{ ZONE_CONFIG[currentZone].minPrice }} ₽</template>
                          <template v-else>уточняется</template>
                        </span>
                      </div>
                    </template>
                    <div v-else class="flex justify-between">
                      <span class="text-neutral-500">Стоимость</span>
                      <span class="font-medium text-emerald-600">Бесплатно</span>
                    </div>
                  </div>
                </div>

                <!-- Оформление -->
                <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div class="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800">
                    <p class="text-xs font-bold tracking-widest uppercase text-neutral-400">Оформление</p>
                    <button class="text-xs text-primary-500 hover:text-primary-600" @click="currentStep = 2">Изменить</button>
                  </div>
                  <div class="px-4 py-3 space-y-1.5 text-sm">
                    <div class="flex justify-between">
                      <span class="text-neutral-500">Вариант</span>
                      <span class="font-medium dark:text-white">
                        {{ framingOptions.find(o => o.value === form.framing)?.title || '—' }}
                      </span>
                    </div>
                    <div v-if="form.framing && form.framing !== 'none'" class="flex justify-between">
                      <span class="text-neutral-500">Стоимость</span>
                      <span class="font-medium dark:text-white">
                        от {{ framingOptions.find(o => o.value === form.framing)?.price?.toLocaleString('ru') }} ₽
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Товары -->
                <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div class="px-4 py-3 bg-neutral-50 dark:bg-neutral-800">
                    <p class="text-xs font-bold tracking-widest uppercase text-neutral-400">Товары</p>
                  </div>
                  <div class="px-4 py-3 space-y-2 text-sm">
                    <div v-for="item in shoppingCart" :key="item.item.id" class="flex justify-between">
                      <span class="text-neutral-600 dark:text-neutral-300">{{ item.item.title }} × {{ item.amount }}</span>
                      <span class="font-medium dark:text-white">₽{{ item.item.price * item.amount }}</span>
                    </div>
                    <div class="border-t border-neutral-200 dark:border-neutral-700 pt-2 flex justify-between font-bold">
                      <span class="dark:text-white">Итого</span>
                      <span class="text-primary-600 dark:text-primary-400">₽{{ totalPurchaseAmount }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ── STEP 4: Оплата ── -->
              <div v-else-if="currentStep === 4" class="space-y-4">
                <div
                  class="flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all"
                  :class="form.payment === 'yookassa'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'"
                  @click="form.payment = 'yookassa'"
                >
                  <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center shrink-0">
                    <UIcon name="heroicons:credit-card" class="w-5 h-5 text-primary-600" />
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-neutral-900 dark:text-white">Онлайн оплата</p>
                    <p class="text-sm text-neutral-500">Карта, СБП, ЮMoney — через ЮKassa</p>
                  </div>
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
                    :class="form.payment === 'yookassa' ? 'border-primary-500' : 'border-neutral-300 dark:border-neutral-600'"
                  >
                    <div
                      v-if="form.payment === 'yookassa'"
                      class="w-2.5 h-2.5 rounded-full bg-primary-500"
                    />
                  </div>
                </div>

                <div
                  class="flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all"
                  :class="form.payment === 'manual'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'"
                  @click="form.payment = 'manual'"
                >
                  <div class="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <UIcon name="heroicons:chat-bubble-left-right" class="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-neutral-900 dark:text-white">Перевод вручную</p>
                    <p class="text-sm text-neutral-500">Свяжемся с вами для подтверждения</p>
                  </div>
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
                    :class="form.payment === 'manual' ? 'border-primary-500' : 'border-neutral-300 dark:border-neutral-600'"
                  >
                    <div
                      v-if="form.payment === 'manual'"
                      class="w-2.5 h-2.5 rounded-full bg-primary-500"
                    />
                  </div>
                </div>

                <!-- Order summary -->
                <div class="mt-2 p-5 rounded-xl bg-neutral-50 dark:bg-neutral-800 space-y-2">
                  <p class="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-3">
                    Ваш заказ
                  </p>
                  <div
                    v-for="item in shoppingCart"
                    :key="item.item.id"
                    class="flex justify-between text-sm"
                  >
                    <span class="text-neutral-600 dark:text-neutral-300">
                      {{ item.item.title }} × {{ item.amount }}
                    </span>
                    <span class="font-medium text-neutral-900 dark:text-white">
                      ₽{{ item.item.price * item.amount }}
                    </span>
                  </div>
                  <!-- Доставка -->
                  <div class="flex justify-between text-sm">
                    <span class="text-neutral-500 dark:text-neutral-400">
                      {{ form.deliveryType === 'pickup' ? 'Самовывоз (СПб)' : 'Доставка СДЭК' }}
                    </span>
                    <span class="font-medium text-neutral-700 dark:text-neutral-300">
                      <template v-if="form.deliveryType === 'pickup'">Бесплатно</template>
                      <template v-else-if="currentZone && ZONE_CONFIG[currentZone].minPrice">
                        от {{ ZONE_CONFIG[currentZone].minPrice }} ₽
                      </template>
                      <template v-else-if="currentZone">уточняется</template>
                      <template v-else>—</template>
                    </span>
                  </div>
                  <div v-if="form.framing && form.framing !== 'none'" class="flex justify-between text-sm">
                    <span class="text-neutral-500 dark:text-neutral-400">
                      {{ framingOptions.find(o => o.value === form.framing)?.title }}
                    </span>
                    <span class="font-medium text-neutral-700 dark:text-neutral-300">
                      от {{ framingOptions.find(o => o.value === form.framing)?.price?.toLocaleString('ru') }} ₽
                    </span>
                  </div>

                  <div class="border-t border-neutral-200 dark:border-neutral-700 pt-3 flex justify-between font-bold">
                    <span class="text-neutral-900 dark:text-white">Итого</span>
                    <span class="text-primary-600 dark:text-primary-400">₽{{ totalPurchaseAmount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Navigation -->
          <div class="flex gap-3 mt-10">
            <UButton
              v-if="currentStep > 0"
              variant="outline"
              color="neutral"
              size="xl"
              @click="prevStep"
            >
              Назад
            </UButton>
            <UButton
              size="xl"
              class="flex-1"
              color="primary"
              :disabled="!canProceed"
              @click="nextStep"
            >
              {{ currentStep === steps.length - 1 ? 'Оформить заказ' : 'Продолжить' }}
            </UButton>
          </div>
        </div>

        <!-- Vertical progress stepper -->
        <div class="hidden lg:flex flex-col items-center justify-center w-14 py-16 pr-3">
          <template v-for="(_step, index) in steps" :key="index">
            <div
              class="w-3 h-3 rounded-full border-2 transition-all duration-500 relative"
              :class="{
                'border-primary-500 bg-primary-500 scale-[1.4] shadow-[0_0_0_4px_rgba(6,182,212,0.2)]': index === currentStep,
                'border-primary-500 bg-primary-500': index < currentStep,
                'border-neutral-300 dark:border-neutral-600 bg-transparent': index > currentStep,
              }"
            >
              <Transition name="fade">
                <UIcon
                  v-if="index < currentStep"
                  name="heroicons:check-16-solid"
                  class="absolute inset-0 m-auto w-2 h-2 text-white"
                />
              </Transition>
            </div>
            <div
              v-if="index < steps.length - 1"
              class="w-0.5 h-14 transition-all duration-700 delay-200"
              :class="index < currentStep
                ? 'bg-primary-500'
                : 'bg-neutral-200 dark:bg-neutral-700'"
            />
          </template>
        </div>

      </div>
    </div>
  </UApp>
</template>

<script setup lang="ts">
  import type { DaDataSuggestion } from '~/types'
  import { useDeliveryZone } from '~/composables/useDeliveryZone'

  definePageMeta({ layout: false })

  const { suggestions, fetchAddresses } = useDaDataAddress()
  const { shoppingCart, totalPurchaseAmount } = storeToRefs(useBasketStore())
  const { getZone, ZONE_CONFIG } = useDeliveryZone()

  const currentStep = ref(0)
  const addressQuery = ref('')
  const selectedRegion = ref('')
  const selectedCity = ref('')

  const form = reactive({
    name: '',
    email: '',
    phone: '',
    nickname: '',
    messengers: [] as string[],
    deliveryType: 'pickup' as 'pickup' | 'delivery',
    recipient: '',
    address: '',
    framing: '' as 'none' | 'simple' | 'premium' | '',
    payment: '' as 'yookassa' | 'manual' | '',
  })

  const framingOptions = [
    {
      value: 'none',
      title: 'Без рамки',
      description: 'Работа без дополнительного оформления',
      icon: 'heroicons:x-mark',
      price: null as number | null,
    },
    {
      value: 'simple',
      title: 'Рама с паспарту',
      description: 'Классическая рама с белым паспарту',
      icon: 'heroicons:square-2-stack',
      price: 2000,
    },
    {
      value: 'premium',
      title: 'Багет с паспарту',
      description: 'Профессиональный багет с паспарту',
      icon: 'heroicons:sparkles',
      price: 5000,
    },
  ]

  const currentZone = computed(() => getZone(selectedRegion.value))

  const framingImageMap = {
    '': '/product-design/без_оформления.png',
    none: '/product-design/без_оформления.png',
    simple: '/product-design/в_раме_с_паспарту.png',
    premium: '/product-design/в_багете_с_паспарту.png',
  }
  const framingAltMap = {
    '': 'Без оформления',
    none: 'Без оформления',
    simple: 'Рама с паспарту',
    premium: 'Багет с паспарту',
  }
  const framingImageSrc = computed(() => framingImageMap[form.framing] ?? framingImageMap[''])
  const framingImageAlt = computed(() => framingAltMap[form.framing] ?? framingAltMap[''])

  const messengerOptions = [
    { value: 'vk', label: 'ВКонтакте' },
    { value: 'tg', label: 'Телеграм' },
    { value: 'phone', label: 'Звонок' },
  ]

  const paymentMethods = ['VISA', 'MasterCard', 'МИР', 'СБП', 'ЮMoney']

  const timelineSteps = [
    { icon: 'heroicons:shopping-bag', title: 'Заказ', time: 'прямо сейчас', caption: 'Новый заказ — уже вижу его!' },
    { icon: 'heroicons:chat-bubble-left-right', title: 'Я свяжусь', time: 'в течение часа', caption: 'Пишу вам, согласуем детали' },
    { icon: 'heroicons:gift', title: 'Упакую работу', time: '1–2 дня', caption: 'Бережно упаковываю с любовью' },
    { icon: 'heroicons:truck', title: 'Доставка', time: '3–7 дней', caption: 'Передаю курьеру, отправляю!' },
    { icon: 'heroicons:home-modern', title: 'У вас', time: 'готово!', caption: 'Картина нашла свой дом' },
  ]

  const activeTimelineStep = ref(0)
  let timelineInterval: ReturnType<typeof setInterval> | null = null

  function startTimelineLoop() {
    stopTimelineLoop()
    activeTimelineStep.value = 0
    timelineInterval = setInterval(() => {
      if (activeTimelineStep.value < timelineSteps.length - 1) {
        activeTimelineStep.value++
      } else {
        // Последний шаг — останавливаем интервал, пауза 2с, чистый перезапуск
        stopTimelineLoop()
        setTimeout(startTimelineLoop, 2000)
      }
    }, 1500)
  }

  function stopTimelineLoop() {
    if (timelineInterval) {
      clearInterval(timelineInterval)
      timelineInterval = null
    }
  }

  watch(currentStep, (step) => {
    if (step === 0) startTimelineLoop()
    else stopTimelineLoop()
  }, { immediate: true })

  onUnmounted(() => stopTimelineLoop())

  const steps = [
    {
      label: 'Шаг первый',
      title: 'Ваши данные',
      description: 'Укажите контактную информацию для связи',
      image: '/gallery/8.jpg',
      imageCaption: 'Расскажите о себе',
    },
    {
      label: 'Шаг второй',
      title: 'Доставка',
      description: 'Выберите удобный способ получения',
      image: '/gallery/3.jpg',
      imageCaption: 'Как доставить работу',
    },
    {
      label: 'Шаг третий',
      title: 'Оформление',
      description: 'Добавьте рамку или другое оформление для вашей работы',
      image: '/gallery/11.jpg',
      imageCaption: 'Подчеркните работу',
    },
    {
      label: 'Шаг четвёртый',
      title: 'Ваш заказ',
      description: 'Проверьте всё перед оплатой',
      image: '/gallery/14.jpg',
      imageCaption: 'Почти готово',
    },
    {
      label: 'Шаг пятый',
      title: 'Оплата',
      description: 'Выберите удобный способ оплаты',
      image: '/gallery/14.jpg',
      imageCaption: 'Финальный шаг',
    },
  ]

  const canProceed = computed(() => {
    if (currentStep.value === 0) {
      const base = form.name.trim().length > 1 && form.email.trim().includes('@')
      const messenger = form.messengers.length > 0
      const phone = form.messengers.includes('phone') ? form.phone.trim().length > 5 : true
      const nick = form.messengers.some(m => ['vk', 'tg'].includes(m))
        ? form.nickname.trim().length > 1
        : true
      return base && messenger && phone && nick
    }
    if (currentStep.value === 1) {
      if (form.deliveryType === 'delivery') {
        return addressQuery.value.trim().length > 3 && form.recipient.trim().length > 3
      }
      return true
    }
    if (currentStep.value === 2) return form.framing !== ''
    if (currentStep.value === 3) return true
    if (currentStep.value === 4) return form.payment !== ''
    return false
  })

  function toggleMessenger(value: string) {
    const idx = form.messengers.indexOf(value)
    if (idx === -1) form.messengers.push(value)
    else form.messengers.splice(idx, 1)
  }

  function selectSuggestion(s: DaDataSuggestion) {
    addressQuery.value = s.value
    form.address = s.value
    selectedRegion.value = s.data.region ?? s.data.city ?? ''
    selectedCity.value = s.data.city ?? s.data.settlement ?? s.data.region ?? ''
    suggestions.value = []
  }

  function nextStep() {
    if (!canProceed.value) return
    if (currentStep.value < steps.length - 1) {
      currentStep.value++
    }
  }

  function prevStep() {
    if (currentStep.value > 0) currentStep.value--
  }
</script>

<style scoped>
  .step-image-enter-active,
  .step-image-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .step-image-enter-from {
    opacity: 0;
    transform: scale(1.04);
  }
  .step-image-leave-to {
    opacity: 0;
    transform: scale(0.97);
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .slide-up-enter-from {
    opacity: 0;
    transform: translateY(10px);
  }
  .slide-up-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .illustration-enter-active,
  .illustration-leave-active {
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
  .illustration-enter-from {
    opacity: 0;
    transform: scale(1.03);
  }
  .illustration-leave-to {
    opacity: 0;
    transform: scale(0.97);
  }
</style>
