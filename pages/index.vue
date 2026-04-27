<template>
  <TransitionGroup name="fade">
    <template v-if="isLoading">
      <AppPreloaderSpinner />
    </template>
  </TransitionGroup>

  <AppHeader id="header" />
  <AboutHeader />
  <main class="pt-30 pb-10 min-h-[100vh]">
    <AboutHero class="mb-30" />
    <AboutTimeline class="mb-10" />
    <div class="flex justify-center mb-20">
      <UButton
        class="hover:transform hover:scale-110 transition-transform
          duration-200 hidden sm:flex"
        icon="heroicons:arrow-up"
        size="xl"
        variant="link"
        color="neutral"
        to="#header"
      >
        {{ printLocale('about_arrow_up') }}
      </UButton>
    </div>
    <AboutGallery />
  </main>
  <AppFooter />
</template>

<script setup>
  import Lenis from 'lenis'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { awaitImage } from '~/helpers/useImages'

  definePageMeta({
    layout: false,
  })

  const { printLocale } = useLocales()
  const { loadImages } = awaitImage()

  useSeo({
    title: 'Обо мне',
    description:
      'Юлия Калашникова - художник-акварелист. Узнайте больше о моем творческом пути, работах и уроках акварельной живописи.',
    image: '/logo.png',
  })

  const isLoading = ref(false)

  gsap.registerPlugin(ScrollTrigger)

  let lenis
  let rafCallback

  onMounted(async () => {
    isLoading.value = true

    lenis = new Lenis({
      duration: 1.4,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    lenis.on('scroll', ScrollTrigger.update)
    lenis.on('scroll', ({ scroll }) => {
      document.documentElement.style.setProperty('--scrollTop', `${scroll}px`)
    })

    rafCallback = time => lenis.raf(time * 1000)
    gsap.ticker.add(rafCallback)
    gsap.ticker.lagSmoothing(0)

    gsap.set('#header', { opacity: 0 })
    ScrollTrigger.create({
      trigger: 'main',
      start: 'top top',
      onEnter: () => gsap.to('#header', { opacity: 1, duration: 0.4 }),
      onLeaveBack: () => gsap.to('#header', { opacity: 0, duration: 0.3 }),
    })

    const isMobile = window.innerWidth < 768
    const isDarkTheme = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches

    const themePrefix = isDarkTheme ? 'dark_' : ''
    const fileSuffix = isMobile ? '_mobile' : ''

    await loadImages([
      `/base-layer${fileSuffix}.webp`,
      `/middle-layer${fileSuffix}.webp`,
      `/front-layer${fileSuffix}.webp`,
      `/water${fileSuffix}.webp`,
      `/dark_base-layer${fileSuffix}.webp`,
      `/dark_middle-layer${fileSuffix}.webp`,
      `/dark_front-layer${fileSuffix}.webp`,
      `/dark_water${fileSuffix}.webp`,
    ])

    await loadImages([
      `/${themePrefix}base-layer${fileSuffix}.webp`,
      `/${themePrefix}middle-layer${fileSuffix}.webp`,
      `/${themePrefix}front-layer${fileSuffix}.webp`,
      `/${themePrefix}water${fileSuffix}.webp`,
    ])

    isLoading.value = false
  })

  onUnmounted(() => {
    document.documentElement.style.removeProperty('--scrollTop')
    gsap.ticker.remove(rafCallback)
    lenis.destroy()
    ScrollTrigger.getAll().forEach(st => st.kill())
  })
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.7s ease;
  }

  .fade-leave-to {
    opacity: 0;
  }
</style>
