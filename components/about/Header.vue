<template>
  <header
    class="relative after:content-[''] after:absolute after:z-[1000]
      after:w-full after:h-[calc(var(--index)*10)] after:bg-[url(/water.webp)]
      after:bg-cover after:bg-no-repeat after:bg-center
      after:bottom-[calc(var(--index)*-3.4)]"
  >
    <section class="layers">
      <div ref="container" class="layer__header">
        <h3 class="layers__caption">
          {{ printLocale('about_header_subtitle') }}
        </h3>
        <h1 class="layers__title">{{ printLocale('about_header_title') }}</h1>
      </div>
      <div class="layer layers__base"></div>
      <div class="layer layers__middle"></div>
      <div class="layer layers__front"></div>
    </section>
  </header>
</template>

<script setup>
  const { printLocale } = useLocales()

  const container = ref(null)

  // onMounted(() => {
  //   gsap.registerPlugin(SplitText)

  //   const split = new SplitText(container.value, { type: 'lines' })

  //   gsap.from(split.lines, {
  //     duration: 2,
  //     y: 100,
  //     autoAlpha: 0,
  //     stagger: 0.05,
  //     delay: 2,
  //   })
  // })
</script>

<style scoped>
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
    transition: var(--transition-header-title);
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
</style>
