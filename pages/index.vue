<template>
  <div id="wrapper">
    <AppPreloaderSpinner v-if="isLoading" />
    <div v-else id="content">
      <AboutHeader />
      <main class="pt-30 pb-15 min-h-[100vh]">
        <AppHeader id="header" />
        <AboutHero class="mb-30" />
        <AboutTimeline class="mb-30" />
        <AboutGallery />
      </main>
    </div>
  </div>
</template>

<script setup>
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { ScrollSmoother } from 'gsap/ScrollSmoother'

  definePageMeta({
    layout: false,
  })

  const isLoading = ref(false)

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

  let smoother
  const handleScroll = () => {
    document.body.style.cssText += `--scrollTop: ${window.scrollY}px`
  }

  onMounted(() => {
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

    setTimeout(() => (isLoading.value = false), 2000)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    document.body.style.cssText = '--scrollTop: 0px'
    smoother.kill()
    ScrollTrigger.getAll().forEach(st => st.kill())
  })
</script>
