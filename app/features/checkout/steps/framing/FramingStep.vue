<template>
  <div class="space-y-3">
    <div
      v-for="opt in FRAMING_OPTIONS"
      :key="opt.value"
      class="flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all"
      :class="form.framing === opt.value
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'"
      @click="form.framing = opt.value"
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
</template>

<script setup lang="ts">
import { useCheckoutStore } from '../../store'
import { FRAMING_OPTIONS } from './config'

const { form } = useCheckoutStore()
</script>
