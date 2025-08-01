<template>
  <AppPreloaderSpinner v-if="isLoading" />
  <div v-else>
    <div id="wrapper">
      <div id="content">
        <AboutHeader />
        <article class="main-article">
          <AboutHero />
        </article>
        <AboutGallery />
        <div class="copyright">© Kalashyulya 2025</div>
      </div>
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

  const { isLoading, startLoader } = usePageLoader()

  const handleScroll = () => {
    document.body.style.cssText += `--scrollTop: ${window.scrollY}px`
  }

  onMounted(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

    startLoader()

    window.addEventListener('scroll', handleScroll)

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

<style>
  .main-header {
    position: relative;
  }

  .main-header::after {
    content: '';
    position: absolute;
    z-index: 1000;
    width: 100%;
    height: calc(var(--index) * 10);
    background-image: url(/water.webp);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    bottom: calc(var(--index) * -3.4);
  }

  .layers {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    overflow: hidden;
    position: relative;
  }

  .layer {
    height: 100%;
    width: 100%;
    position: absolute;
    background-size: cover;
    background-position: center;
    transition: var(--transition);
    scroll-behavior: smooth;
    will-change: transform;
    z-index: 2;
    scrollbar-gutter: stable;
  }

  .layer__header {
    z-index: 1;
    transform: translate3d(0, calc(var(--scrollTop) / 2), 0);
    transition: var(--transition);
    will-change: transform;
    font-weight: 900;
    color: #37778f;
    text-shadow: 0 0 12px #d8e5e9;
  }

  .layers__caption {
    font-size: calc(var(--index) * 1.2);
    letter-spacing: calc(var(--index) / 30);
    margin-top: calc(var(--index) / -0.07);
  }

  .layers__title {
    font-size: calc(var(--index) * 3);
    letter-spacing: calc(var(--index) / 20);
  }

  .layers__base {
    top: calc(var(--index) * -5);
    background-image: url(/base-layer.webp);
    transform: translate3d(0, calc(var(--scrollTop) / 1.5), 0);
    z-index: 0;
  }

  .layers__middle {
    background-image: url(/middle-layer.webp);
    transform: translate3d(0, calc(var(--scrollTop) / 3.5), 0);
  }

  .layers__front {
    background-image: url(/front-layer.webp);
    transform: translate3d(0, calc(var(--scrollTop) / 5.5), 0);
  }

  .main-article {
    margin-top: 7rem;
    --main-article-transform: translate3d(0, calc(var(--scrollTop) / -9.5), 0);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    text-align: center;
    will-change: transform;
  }

  .navigation {
    transform: translate3d(0, calc(var(--scrollTop) / 18), 0);
    will-change: transform;
  }

  .main-article__picture {
    transform: var(--main-article-transform);
    transition: var(--transition);
    will-change: transform;
  }

  .main-article__header {
    text-transform: uppercase;
    font-size: calc(var(--index) * 1.8);
    letter-spacing: calc(var(--index) * 0.1);
    transform: var(--main-article-transform);
    transition: var(--transition);
    will-change: transform;
  }

  .main-article__paragraph {
    max-width: calc(var(--index) * 30);
    font-size: calc(var(--index) * 0.75);
    transform: var(--main-article-transform);
    transition: var(--transition);
    will-change: transform;
  }

  .copyright {
    position: absolute;
    bottom: calc(var(--index) * 2.5);
    opacity: 0.45;
    font-size: calc(var(--index) * 0.7);
    letter-spacing: calc(var(--index) / 15);
  }

  .gallery__content {
    columns: 300px;
    column-gap: var(--gap);
    padding: calc(var(--gap) / 1.25);
  }

  .item {
    margin-bottom: var(--gap);
  }

  .item img {
    width: 100%;
    display: block;
  }

  .logo {
    position: fixed;
    z-index: 1001;
  }
</style>
