<template>
  <UApp>
    <div class="min-h-screen flex bg-white dark:bg-neutral-900">

      <CheckoutLeftPanel :current-step-id="currentStepId" :form="store.form" />

      <!-- Right: form + stepper rail -->
      <div class="flex-1 flex min-h-screen">
        <div class="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-14 py-16 max-w-lg">

          <!-- Top nav -->
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
                v-for="(_step, i) in activeSteps"
                :key="i"
                class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                :class="current === i
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'"
                @click="goTo(i)"
              >
                {{ i + 1 }}
              </button>
            </div>
          </div>

          <!-- Step label -->
          <Transition name="slide-up" mode="out-in">
            <p
              :key="`label-${currentStepId}`"
              class="text-xs font-bold tracking-[0.2em] uppercase text-primary-500 mb-2"
            >
              {{ currentStep?.label }}
            </p>
          </Transition>

          <!-- Step heading -->
          <Transition name="slide-up" mode="out-in">
            <div :key="`heading-${currentStepId}`" class="mb-8">
              <h1 class="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white leading-tight mb-2">
                {{ currentStep?.title }}
              </h1>
              <p class="text-neutral-500 dark:text-neutral-400 text-sm">
                {{ currentStep?.description }}
              </p>
            </div>
          </Transition>

          <!-- Step content — рендер по ID, а не по индексу -->
          <Transition name="slide-up" mode="out-in">
            <div :key="`step-${currentStepId}`">
              <CheckoutContactsStep v-if="currentStepId === 'contacts'" />
              <CheckoutDeliveryStep v-else-if="currentStepId === 'delivery'" />
              <CheckoutFramingStep v-else-if="currentStepId === 'framing'" />
              <CheckoutSummaryStep v-else-if="currentStepId === 'summary'" @go-to-id="goToById" />
              <CheckoutPaymentStep v-else-if="currentStepId === 'payment'" />
            </div>
          </Transition>

          <!-- Navigation -->
          <div class="flex gap-3 mt-10">
            <UButton
              v-if="!isFirst"
              variant="outline"
              color="neutral"
              size="xl"
              :disabled="isSubmitting"
              @click="prev"
            >
              Назад
            </UButton>
            <UButton
              size="xl"
              class="flex-1"
              color="primary"
              :disabled="!canProceed || isSubmitting"
              :loading="isSubmitting"
              @click="advance"
            >
              {{ isLast ? 'Оформить заказ' : 'Продолжить' }}
            </UButton>
          </div>

        </div>

        <CheckoutStepperRail :current="current" :count="activeSteps.length" />
      </div>

    </div>
  </UApp>
</template>

<script setup lang="ts">
import { useCheckout } from '../useCheckout'
import CheckoutLeftPanel from './LeftPanel.vue'
import CheckoutStepperRail from './StepperRail.vue'
import CheckoutContactsStep from '../steps/contacts/ContactsStep.vue'
import CheckoutDeliveryStep from '../steps/delivery/DeliveryStep.vue'
import CheckoutFramingStep from '../steps/framing/FramingStep.vue'
import CheckoutSummaryStep from '../steps/summary/SummaryStep.vue'
import CheckoutPaymentStep from '../steps/payment/PaymentStep.vue'

const {
  current,
  isFirst,
  isLast,
  isSubmitting,
  prev,
  goTo,
  goToById,
  advance,
  canProceed,
  activeSteps,
  currentStep,
  currentStepId,
  store,
} = useCheckout()
</script>

<style scoped>
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
