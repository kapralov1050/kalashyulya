<template>
  <TransitionGroup name="fade">
    <template v-if="isLoading">
      <AppPreloaderSpinner />
    </template>
  </TransitionGroup>

  <AppHeader id="header" />
  <div id="wrapper">
    <div id="content">
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
    </div>
  </div>
</template>

<script setup>
  import { gsap } from 'gsap'
  import { ScrollSmoother } from 'gsap/ScrollSmoother'
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

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

  let smoother
  const handleScroll = () => {
    document.documentElement.style.setProperty('--scrollTop', `${window.scrollY}px`)
  }

  onMounted(async () => {
    isLoading.value = true
    window.addEventListener('scroll', handleScroll)

    smoother = ScrollSmoother.create({
      wrapper: '#wrapper',
      content: '#content',
      smooth: 1.4,
      effects: true,
      normalizeScroll: true,
    })

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
    window.removeEventListener('scroll', handleScroll)
    document.documentElement.style.removeProperty('--scrollTop')
    smoother.kill()
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

  #wrapper {
    opacity: 1;
    transition: opacity 0.3s ease;
  }
</style>
