<template>
  <header
    class="relative after:content-[''] after:absolute after:z-[1000]
      after:w-full after:h-[calc(var(--index)*10)] after:bg-[url(/water.webp)]
      after:bg-cover after:bg-no-repeat after:bg-center
      after:bottom-[calc(var(--index)*-4.2)]
      dark:after:bg-[url(/dark_water.webp)]"
  >
    <section class="layers">
      <div
        ref="container"
        class="layer__header dark:text-neutral-700 text-neutral-500"
      >
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
  }

  .layers__caption {
    font-size: calc(var(--index) * 1.2);
    letter-spacing: calc(var(--index) / 30);
    margin-top: calc(var(--index) / -0.07);
    color: var(--main-color);
  }

  .layers__title {
    font-size: calc(var(--index) * 2.7);
    letter-spacing: calc(var(--index) / 20);
    color: var(--main-color);
  }

  .layers__base {
    top: calc(var(--index) * -5);
    background-image: var(--base-layer);
    transform: translate3d(0, calc(var(--scrollTop) / 1.5), 0);
    z-index: 0;
  }

  .layers__middle {
    background-image: var(--middle-layer);
    transform: translate3d(0, calc(var(--scrollTop) / 3.5), 0);
  }

  .layers__front {
    background-image: var(--front-layer);
    transform: translate3d(0, calc(var(--scrollTop) / 5.5), 0);
  }
</style>
