<template>
  <div class="flex flex-col items-center text-center relative p-10">
    <!-- Акварельное мягкое пятно -->
    <svg
      ref="blob"
      class="w-[150px] h-[150px]"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        id="blob-path"
        fill="#25b0b8"
        fill-opacity="0.55"
        d="M42.4,-71C54.6,-63.2,63,-51.4,71.3,-38.3C79.5,-25.3,87.6,-12.1,87.5,0.1C87.4,12.3,79.2,24.6,70.2,36.4C61.3,48.2,51.6,59.4,39.4,67.4C27.1,75.4,13.6,80.1,-0.8,81.4C-15.3,82.8,-30.6,80.8,-44.6,74.6C-58.6,68.3,-71.3,57.9,-78.3,44.6C-85.3,31.2,-86.5,15.6,-85.9,0.5C-85.3,-14.7,-83,-29.4,-75.3,-41.4C-67.6,-53.5,-54.6,-63,-40.6,-69.1C-26.7,-75.2,-13.4,-77.9,0,-78C13.4,-78,26.7,-75,42.4,-71Z"
        transform="translate(100 100)"
      />
    </svg>

    <!-- Минималистичная белая галочка -->
    <svg
      ref="icon"
      class="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[80px] h-[80px] select-none"
      viewBox="0 0 52 52"
    >
      <path
        class="check-path"
        d="M14 27l7 7 17-17"
        fill="none"
        stroke="white"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <h1 class="mt-6 text-xl font-bold text-neutral-900 dark:text-neutral-200">
      Спасибо! Ваш заказ успешно оформлен
    </h1>

    <p class="mt-2 text-base text-neutral-600 dark:text-neutral-400 max-w-xs">
      В ближайшее время я свяжусь с вами способом, который вы указали в заявке
    </p>
  </div>
</template>

<script setup>
  import { gsap } from 'gsap'
  import { onMounted, ref } from 'vue'

  const blob = ref(null)
  const icon = ref(null)

  onMounted(() => {
    const tl = gsap.timeline()

    // Плавное появление акварельного пятна
    tl.from(blob.value, {
      scale: 0.4,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out',
    })

    // "Дыхание" акварельного контура
    gsap.to('#blob-path', {
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      attr: {
        d: `
        M38,-65C51,-57,61,-46,69,-33C77,-20,82,-5,81,9C80,22,74,35,64,46C54,57,40,65,25,72C10,79,-5,85,-19,82C-34,80,-48,69,-58,55C-69,41,-77,25,-77,9C-76,-7,-68,-23,-60,-37C-52,-51,-44,-63,-31,-71C-18,-80,-9,-85,3,-86C15,-87,30,-84,38,-65Z
      `,
      },
    })

    // Появление галочки
    tl.from(
      icon.value,
      {
        scale: 0.3,
        opacity: 0,
        y: 15,
        duration: 0.7,
        ease: 'back.out(2)',
      },
      '-0.7',
    )
  })
</script>
