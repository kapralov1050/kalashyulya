<template>
  <!-- <div  class="relative scale-90 lg:w-2/3 lg:scale-110 lg:perspective-distant">
    <div class="hero-reflection"></div>
    <img src="/editor.jpg" alt="Editor UI" class="hero-image" />
  </div> -->
  <div
    ref="container"
    class="relative w-full aspect-[16/9] h-auto scale-90 lg:w-2/3 lg:scale-105
      perspective-distant"
  >
    <NuxtImg
      :src="imageSrc"
      class="rounded-2xl shadow-2xl h-full object-cover"
      :style="cardStyle"
    />
  </div>
</template>

<script setup lang="ts">
  defineProps<{ imageSrc: string }>()

  const container = ref<HTMLElement | null>(null)

  const { roll, tilt } = useParallax(container)

  const cardStyle = computed(() => ({
    transform: `rotateX(${roll.value * 20}deg) rotateY(${tilt.value * 20}deg)`,
    transition: 'transform 0.1s ease-out',
  }))
</script>
