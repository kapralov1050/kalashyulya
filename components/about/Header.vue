<template>
  <header class="main-header">
    <AppLogo
      class="logo text-xl sm:text-2xl mt-5 ml-15"
      icon-classes="size-8 text-indigo-600 sm:size-12 dark:text-white"
    />
    <section class="layers">
      <div ref="container" class="layer__header">
        <h3 class="layers__caption">художник-акварелист</h3>
        <h1 class="layers__title">Юлия Калашникова</h1>
      </div>
      <div class="layer layers__base"></div>
      <div class="layer layers__middle"></div>
      <div class="layer layers__front"></div>
    </section>
  </header>
</template>

<script setup>
  import { gsap } from 'gsap'
  import { SplitText } from 'gsap/SplitText'

  const container = ref(null)

  onMounted(() => {
    gsap.registerPlugin(SplitText)

    const split = new SplitText(container.value, { type: 'lines' })

    gsap.from(split.lines, {
      duration: 1,
      y: 100,
      autoAlpha: 0,
      stagger: 0.05,
    })
  })
</script>
