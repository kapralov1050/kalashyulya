<template>
  <div
    class="min-h-screen w-full flex flex-col bg-white dark:bg-neutral-900 select-none"
    @click="handleTap"
  >

    <!-- Stories progress bar -->
    <div class="flex gap-1.5 px-4 pt-12 pb-4 shrink-0">
      <div
        v-for="(_, i) in STEPS"
        :key="i"
        class="flex-1 h-[3px] rounded-full transition-colors duration-300"
        :class="i <= activeStep ? 'bg-primary-500' : 'bg-black/10 dark:bg-white/15'"
      />
    </div>

    <!-- Author label -->
    <div class="flex items-center gap-3 px-5 shrink-0">
      <div class="relative shrink-0">
        <img
          src="/timeline/1.webp"
          alt="Юля"
          class="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800 shadow-sm"
        />
        <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-neutral-800 flex items-center justify-center">
          <UIcon name="heroicons:check-16-solid" class="w-2.5 h-2.5 text-white" />
        </div>
      </div>
      <p class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Художник Юлия Калашникова
      </p>
    </div>

    <!-- Main image + step info -->
    <div class="flex-1 flex flex-col justify-center gap-5 px-6 py-4 min-h-0">
      <div class="flex items-center justify-center min-h-0 max-h-[55vh]">
        <Transition name="story-img" mode="out-in">
          <img
            :key="activeStep"
            :src="`/delivery-explanations/${activeStep + 1}.jpg`"
            :alt="STEPS[activeStep].title"
            class="max-w-full max-h-full object-contain"
          />
        </Transition>
      </div>
      <Transition name="story-text" mode="out-in">
        <div :key="activeStep" class="shrink-0 text-center max-w-xs mx-auto">
          <p class="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
            {{ STEPS[activeStep].title }}
          </p>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-snug">
            {{ STEPS[activeStep].caption }}
          </p>
        </div>
      </Transition>
    </div>

    <!-- Bottom -->
    <div class="px-6 pt-3 pb-10 shrink-0">
      <Transition name="story-text" mode="out-in">

        <!-- Last step: button -->
        <UButton
          v-if="isLast"
          key="last"
          size="xl"
          class="w-full justify-center"
          color="primary"
          @click.stop="emit('done')"
        >
          Хорошо, начнём
        </UButton>

        <!-- Other steps: tap hint -->
        <p v-else key="hint" class="text-center text-xs text-neutral-400">
          Нажмите на экран, чтобы листать
        </p>

      </Transition>
    </div>

  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ done: [] }>()

const STEPS = [
  {
    title: 'Оформляете заказ',
    caption: 'Выбираете работу и заполняете данные — это займёт пару минут',
  },
  {
    title: 'Я свяжусь с вами',
    caption: 'В течение часа напишу, чтобы согласовать детали и подтвердить заказ',
  },
  {
    title: 'Упакую с любовью',
    caption: 'Бережно упакую работу, чтобы она добралась до вас в целости',
  },
  {
    title: 'Отправлю курьером',
    caption: 'Передам в службу доставки и пришлю трек-номер для отслеживания',
  },
  {
    title: 'Картина у вас дома',
    caption: 'Работа нашла свой дом — надеюсь, она будет радовать вас каждый день',
  },
]

const DURATION = 2800
const activeStep = ref(0)
const isLast = computed(() => activeStep.value === STEPS.length - 1)

let timer: ReturnType<typeof setTimeout> | null = null

function startTimer() {
  stopTimer()
  if (!isLast.value) {
    timer = setTimeout(() => {
      activeStep.value++
      startTimer()
    }, DURATION)
  }
}

function stopTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function handleTap(e: MouseEvent) {
  const third = window.innerWidth / 3
  if (e.clientX < third && activeStep.value > 0) {
    activeStep.value--
    startTimer()
  } else if (e.clientX > third && !isLast.value) {
    activeStep.value++
    startTimer()
  }
}

onMounted(() => startTimer())
onUnmounted(() => stopTimer())
</script>

<style scoped>
.story-img-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.story-img-enter-from {
  opacity: 0;
  transform: scale(1.04);
}
.story-img-leave-active {
  transition: opacity 0.2s ease;
}
.story-img-leave-to {
  opacity: 0;
}

.story-text-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.story-text-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.story-text-leave-active {
  transition: opacity 0.15s ease;
}
.story-text-leave-to {
  opacity: 0;
}
</style>
