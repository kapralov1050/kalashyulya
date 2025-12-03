<template>
  <Transition name="fade">
    <AppPreloaderSpinner v-if="!imagesLoaded" />
  </Transition>

  <Transition name="fade">
    <div v-if="imagesLoaded" id="wrapper">
      <div id="content">
        <AboutHeader />
        <main id="main" class="pt-30 pb-10 min-h-[100vh]">
          <AppHeader id="header" />
          <AboutHero class="mb-30" />
          <AboutTimeline class="mb-30" />
          <AboutGallery />
          <div class="flex justify-center">
            <UButton
              class="hover:transform hover:scale-120 transition-transform
                duration-200"
              icon="heroicons:arrow-up"
              size="xl"
              variant="link"
              color="neutral"
              to="#main"
            >
              {{ printLocale('about_arrow_up') }}
            </UButton>
          </div>
        </main>
      </div>
    </div>
  </Transition>
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
  const { imagesLoaded, loadImages } = awaitImage()

  const isLoading = ref(false)

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

  let smoother
  const handleScroll = () => {
    document.body.style.cssText += `--scrollTop: ${window.scrollY}px`
  }

  onMounted(async () => {
    isLoading.value = true
    window.addEventListener('scroll', handleScroll)

    smoother = ScrollSmoother.create({
      wrapper: '#wrapper',
      content: '#content',
      smooth: 1.2,
      effects: true,
      normalizeScroll: true,
    })

    gsap.from('#header', {
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        start: '-=150',
        end: 'top bottom',
        trigger: '#header',
        toggleActions: 'restart none none reverse',
      },
    })

    await loadImages([
      '/base-layer.webp',
      '/middle-layer.webp',
      '/front-layer.webp',
      '/water.webp',
      '/dark_base-layer.webp',
      '/dark_middle-layer.webp',
      '/dark_front-layer.webp',
      '/dark_water.webp',
    ])
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    document.body.style.cssText = '--scrollTop: 0px'
    smoother.kill()
    ScrollTrigger.getAll().forEach(st => st.kill())
  })
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.7s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  #wrapper {
    opacity: 1;
    transition: opacity 0.3s ease;
  }
</style>
