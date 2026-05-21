<template>
  <div class="hidden lg:block w-[58%] relative shrink-0">
    <div class="sticky top-0 h-screen overflow-hidden">
      <Transition name="step-image" mode="out-in">

        <!-- Step 0: Artist + timeline -->
        <div
          v-if="currentStepId === 'contacts'"
          key="artist"
          class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 px-12 py-12 gap-8"
        >
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
            <h3 class="text-2xl font-bold text-neutral-900 dark:text-white mt-4">Меня зовут Юля</h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed max-w-xs">
              Я лично свяжусь с вами в течение часа, чтобы согласовать детали заказа
            </p>
          </div>

          <div class="w-full">
            <p class="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 text-center mb-4">
              Как происходит покупка
            </p>
            <div class="flex gap-2">
              <button
                v-for="(s, i) in TIMELINE_STEPS"
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

          <div class="w-full">
            <div class="relative flex justify-between items-start">
              <div class="absolute top-4 left-[10%] right-[10%] h-0.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  class="h-full min-w-2 bg-primary-500 transition-all duration-700 ease-out rounded-full"
                  :style="{ width: `${(activeTimelineStep / (TIMELINE_STEPS.length - 1)) * 100}%` }"
                />
              </div>
              <button
                v-for="(s, i) in TIMELINE_STEPS"
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

          <div class="flex items-center gap-2 text-xs text-neutral-400">
            <UIcon name="heroicons:shield-check" class="w-3.5 h-3.5 text-emerald-500" />
            <span>Ваши данные защищены</span>
          </div>
        </div>

        <!-- Step 1: Самовывоз — карта СПб -->
        <div
          v-else-if="currentStepId === 'delivery' && form.deliveryType === 'pickup'"
          key="pickup-map"
          class="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-neutral-900 px-14 py-16 gap-8"
        >
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400">Самовывоз</p>
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

        <!-- Step 1: Доставка — карта зон -->
        <div
          v-else-if="currentStepId === 'delivery' && form.deliveryType === 'delivery'"
          key="delivery-map"
          class="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-neutral-900 px-14 py-16 gap-6"
        >
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400">
            Доставка СДЭК · По России до ПВЗ
          </p>
          <div class="w-full" style="height: 52%">
            <ShopDeliveryZoneMap :zone="currentZone" :city-name="form.city" />
          </div>
          <Transition name="slide-up" mode="out-in">
            <div :key="currentZone ?? 'empty'" class="text-center">
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

        <!-- Step 2: Оформление — мокап -->
        <div
          v-else-if="currentStepId === 'framing'"
          :key="`framing-${form.framing || 'default'}`"
          class="w-full h-full flex items-center justify-center bg-white dark:bg-neutral-800 p-10"
        >
          <img
            :src="framingImageSrc"
            :alt="framingImageAlt"
            class="max-w-full max-h-full object-contain"
          />
        </div>

        <!-- Step 3: Превью корзины -->
        <div
          v-else-if="currentStepId === 'summary'"
          key="summary-preview"
          class="w-full h-full flex flex-col bg-neutral-50 dark:bg-neutral-800 px-14 py-16 overflow-y-auto"
        >
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">
            Ваш заказ
          </p>
          <h3 class="text-3xl font-bold text-neutral-900 dark:text-white mb-8">Ещё раз взгляните</h3>

          <div class="grid gap-4" :class="shoppingCart.length === 1 ? 'grid-cols-1' : 'grid-cols-2'">
            <div
              v-for="el in shoppingCart"
              :key="el.item.id"
              class="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm"
            >
              <div class="aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img :src="el.item.image[0]" :alt="el.item.title" class="w-full h-full object-cover" />
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

          <div class="mt-6 flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm">
            <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center shrink-0">
              <UIcon
                :name="selectedFraming?.icon || 'heroicons:photo'"
                class="w-6 h-6 text-primary-600"
              />
            </div>
            <div class="flex-1">
              <p class="text-xs font-semibold tracking-widest uppercase text-neutral-400">В оформлении</p>
              <p class="font-semibold text-neutral-900 dark:text-white mt-0.5">
                {{ selectedFraming?.title || 'Не выбрано' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Step 4: Trust signals -->
        <div
          v-else-if="currentStepId === 'payment'"
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
          <div class="flex items-center gap-3 mt-10 flex-wrap justify-center">
            <div
              v-for="m in PAYMENT_METHODS"
              :key="m"
              class="px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm text-sm font-bold text-neutral-700 dark:text-neutral-300 min-w-20 text-center"
            >
              {{ m }}
            </div>
          </div>
          <div class="mt-6 flex items-center gap-2 text-sm text-neutral-500">
            <UIcon name="heroicons:shield-check" class="w-4 h-4 text-emerald-500" />
            <span>Платёжный сервис ЮKassa · сертифицирован PCI DSS</span>
          </div>
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
</template>

<script setup lang="ts">
import { useCheckoutStore } from '../store'
import { FRAMING_OPTIONS, FRAMING_IMAGES, FRAMING_ALTS } from '../steps/framing/config'
import { useDeliveryZone } from '~/composables/useDeliveryZone'

const props = defineProps<{
  currentStepId: string | undefined
  form: ReturnType<typeof useCheckoutStore>['form']
}>()

const { shoppingCart } = storeToRefs(useBasketStore())
const { getZone, ZONE_CONFIG } = useDeliveryZone()

const TIMELINE_STEPS = [
  { icon: 'heroicons:shopping-bag', title: 'Заказ', caption: 'Новый заказ — уже вижу его!' },
  { icon: 'heroicons:chat-bubble-left-right', title: 'Я свяжусь', caption: 'Пишу вам, согласуем детали' },
  { icon: 'heroicons:gift', title: 'Упакую работу', caption: 'Бережно упаковываю с любовью' },
  { icon: 'heroicons:truck', title: 'Доставка', caption: 'Передаю курьеру, отправляю!' },
  { icon: 'heroicons:home-modern', title: 'У вас', caption: 'Картина нашла свой дом' },
]

const PAYMENT_METHODS = ['VISA', 'MasterCard', 'МИР', 'СБП', 'ЮMoney']

const activeTimelineStep = ref(0)
let timelineInterval: ReturnType<typeof setInterval> | null = null

function startTimelineLoop() {
  stopTimelineLoop()
  activeTimelineStep.value = 0
  timelineInterval = setInterval(() => {
    if (activeTimelineStep.value < TIMELINE_STEPS.length - 1) {
      activeTimelineStep.value++
    } else {
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

watch(
  () => props.currentStepId,
  (id) => {
    if (id === 'contacts') startTimelineLoop()
    else stopTimelineLoop()
  },
  { immediate: true },
)

onUnmounted(() => stopTimelineLoop())

const currentZone = computed(() => getZone(props.form.region))

const framingImageSrc = computed(() => FRAMING_IMAGES[props.form.framing] ?? FRAMING_IMAGES[''])
const framingImageAlt = computed(() => FRAMING_ALTS[props.form.framing] ?? FRAMING_ALTS[''])
const selectedFraming = computed(() => FRAMING_OPTIONS.find(o => o.value === props.form.framing))
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
</style>
