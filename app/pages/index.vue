<template>
  <Transition name="fade">
    <AppPreloaderSpinner v-if="isLoading" />
  </Transition>

  <AppHeader
    id="header"
    fixed
    class="about-header z-10"
    :class="{ 'about-header--concealed': !isHeaderRevealed }"
  />
  <AboutHeader id="about-cover" />
  <main
    class="flex min-h-[100vh] flex-col gap-y-24 pb-24 pt-30 sm:gap-y-32
      sm:pb-32"
  >
    <AboutHero />
    <LazyAboutTimeline />
    <AboutFeaturedWorks />
    <AboutContact />
  </main>
  <AppFooter />
</template>

<script setup>
  import Lenis from 'lenis'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { awaitImage } from '~/helpers/useImages'
  import { prefersReducedMotion } from '~/utils/motion'

  definePageMeta({
    layout: false,
  })

  const { loadImages } = awaitImage()

  useSeo({
    title: 'Обо мне',
    description:
      'Юлия Калашникова - художник-акварелист. Узнайте больше о моем творческом пути, работах и уроках акварельной живописи.',
    image: '/logo.png',
  })

  const isLoading = ref(true)
  const isHeaderRevealed = ref(false)

  gsap.registerPlugin(ScrollTrigger)

  let lenis
  let rafCallback

  const lockScroll = locked => {
    document.documentElement.style.overflow = locked ? 'hidden' : ''
    if (locked) lenis?.stop()
    else lenis?.start()
  }

  onMounted(async () => {
    if (!prefersReducedMotion()) {
      lenis = new Lenis({
        duration: 1.4,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        syncTouch: true,
        syncTouchLerp: 0.06,
      })

      const setBaseY = gsap.quickSetter('.layers__base', 'y', 'px')
      const setMiddleY = gsap.quickSetter('.layers__middle', 'y', 'px')
      const setFrontY = gsap.quickSetter('.layers__front', 'y', 'px')
      const setHeaderTextY = gsap.quickSetter('.layer__header', 'y', 'px')

      lenis.on('scroll', ScrollTrigger.update)
      lenis.on('scroll', ({ scroll }) => {
        setBaseY(scroll / 1.5)
        setMiddleY(scroll / 3.5)
        setFrontY(scroll / 5.5)
        setHeaderTextY(scroll / 2)
      })

      rafCallback = time => lenis.raf(time * 1000)
      gsap.ticker.add(rafCallback)
      gsap.ticker.lagSmoothing(0)
    }

    lockScroll(true)

    const cover = document.getElementById('about-cover')
    const waterOverlap = () =>
      Math.max(0, -parseFloat(getComputedStyle(cover, '::after').bottom) || 0)
    const headerHeight = () =>
      document.getElementById('header')?.offsetHeight ?? 0

    ScrollTrigger.create({
      trigger: cover,
      start: () => {
        const offset = headerHeight() - waterOverlap()
        return `bottom top${offset >= 0 ? '+=' : '-='}${Math.abs(offset)}`
      },
      onEnter: () => (isHeaderRevealed.value = true),
      onLeaveBack: () => (isHeaderRevealed.value = false),
    })

    const isMobile = window.innerWidth < 768
    const isDarkTheme = document.documentElement.classList.contains('dark')

    const themePrefix = isDarkTheme ? 'dark_' : ''
    const fileSuffix = isMobile ? '_mobile' : ''

    const layers = prefix =>
      ['base-layer', 'middle-layer', 'front-layer', 'water'].map(
        name => `/${prefix}${name}${fileSuffix}.webp`,
      )

    await loadImages(layers(themePrefix)).catch(() => undefined)
    isLoading.value = false
    lockScroll(false)

    loadImages(layers(isDarkTheme ? '' : 'dark_')).catch(() => undefined)
  })

  onUnmounted(() => {
    lockScroll(false)
    if (rafCallback) {
      gsap.ticker.remove(rafCallback)
      gsap.ticker.lagSmoothing(500, 33)
    }
    lenis?.destroy()
    ScrollTrigger.getAll().forEach(st => st.kill())
  })
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 250ms var(--ease-out-strong);
  }

  .fade-leave-to {
    opacity: 0;
  }

  .about-header {
    transition: opacity 200ms var(--ease-out-strong);
  }

  .about-header--concealed:not(:focus-within) {
    opacity: 0;
    pointer-events: none;
    transition-duration: 150ms;
  }
</style>
