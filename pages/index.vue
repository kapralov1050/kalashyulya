<template>
  <div id="wrapper">
    <div id="content">
      <AboutHeader />
      <main class="pt-30 pb-30 min-h-[100vh]">
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

  const handleScroll = () => {
    document.body.style.cssText += `--scrollTop: ${window.scrollY}px`
  }

  onMounted(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

    window.addEventListener('scroll', handleScroll)

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

    ScrollSmoother.create({
      wrapper: '#wrapper',
      content: '#content',
    })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    document.body.style.cssText = '--scrollTop: 0px'
  })
</script>
