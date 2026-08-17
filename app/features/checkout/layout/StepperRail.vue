<template>
  <div class="hidden lg:flex flex-col items-center justify-center w-14 py-16 pr-3">
    <template v-for="(_step, index) in count" :key="index">
      <div
        class="w-3 h-3 rounded-full border-2 transition-all duration-500 relative"
        :class="{
          'border-primary-500 bg-primary-500 scale-[1.4] shadow-[0_0_0_4px_rgba(6,182,212,0.2)]': index === current,
          'border-primary-500 bg-primary-500': index < current,
          'border-neutral-300 dark:border-neutral-600 bg-transparent': index > current,
        }"
      >
        <Transition name="fade">
          <UIcon
            v-if="index < current"
            name="heroicons:check-16-solid"
            class="absolute inset-0 m-auto w-2 h-2 text-white"
          />
        </Transition>
      </div>
      <div
        v-if="index < count - 1"
        class="w-0.5 h-14 transition-all duration-700 delay-200"
        :class="index < current ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-700'"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{ current: number; count: number }>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
