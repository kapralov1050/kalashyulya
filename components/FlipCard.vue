<template>
  <div class="w-150 h-100 p-5 perspective-1000">
    <div
      class="w-full h-full relative transition-transform duration-600
        transform-style-3d cursor-pointer"
      :class="{ 'rotate-y-180': isFlipped }"
      @click="isFlipped = !isFlipped"
    >
      <!-- Лицевая сторона -->
      <div class="absolute inset-0 backface-hidden rounded-xl overflow-hidden">
        <img
          :src="image"
          class="w-full h-full object-cover rounded-xl border-2 border-gray-200
            shadow-sm"
        />
      </div>

      <!-- Обратная сторона -->
      <div
        class="absolute inset-0 backface-hidden rounded-xl p-5 flex flex-col
          justify-center items-center dark:text-white border-2 border-gray-200
          rotate-y-180 overflow-hidden"
      >
        <h3 class="text-xl font-bold mb-2 text-center">{{ title }}</h3>
        <p class="text-sm text-center leading-relaxed">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    title: string
    description: string
    image: string
  }

  defineProps<Props>()

  const isFlipped = ref(false)
</script>

<style scoped>
  .perspective-1000 {
    perspective: 1000px;
  }

  .transform-style-3d {
    transform-style: preserve-3d;
  }

  .backface-hidden {
    backface-visibility: hidden;
  }

  .rotate-y-180 {
    transform: rotateY(180deg);
  }
</style>
