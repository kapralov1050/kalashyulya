<template>
  <header
    class="relative after:content-[''] after:absolute after:z-[3]
      after:w-full after:h-[calc(var(--index)*10)] after:bg-[url(/water.webp)]
      after:bg-cover after:bg-no-repeat after:bg-center
      after:bottom-[calc(var(--index)*-4.2)]
      dark:after:bg-[url(/dark_water.webp)]"
  >
    <section class="layers">
      <div
        ref="container"
        class="layer__header text-neutral-800 dark:text-white"
      >
        <h1 class="layers__title">{{ printLocale('about_header_title') }}</h1>
        <p class="layers__caption order-first">
          {{ printLocale('about_header_subtitle') }}
        </p>
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
    will-change: transform;
    z-index: 2;
  }

  .layer__header {
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: calc(var(--index) / -0.07);
    will-change: transform;
  }

  .layers__caption {
    font-size: calc(var(--index) * 1.2);
    font-weight: 600;
  }

  .layers__title {
    font-size: calc(var(--index) * 2.7);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.01em;
  }

  .layers__base {
    height: calc(100% + calc(var(--index) * 10));
    top: calc(var(--index) * -5);
    background-image: var(--base-layer);
    z-index: 0;
  }

  .layers__middle {
    background-image: var(--middle-layer);
  }

  .layers__front {
    background-image: var(--front-layer);
  }
</style>
