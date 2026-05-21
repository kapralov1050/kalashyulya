<template>
  <div class="preloader-container dark:bg-neutral-900 bg-white">
    <div class="spinner"></div>
  </div>
</template>

<style>
  .preloader-container {
    z-index: 1001;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .spinner {
    width: calc(var(--index) * 8);
    height: calc(var(--index) * 8);
    background-image: var(--preloader);
    background-size: cover;
  }

  .spinner::after {
    position: fixed;
    content: '';
    width: calc(var(--index) * 2);
    height: calc(var(--index) * 2);
    background-image: url(/brush.webp);
    background-size: cover;
    animation: brush 3s ease infinite;
    will-change: transform;
  }

  .dark .spinner::after {
    filter: invert(1);
  }

  @keyframes brush {
    0%,
    100% {
      transform: translateX(calc(var(--index) * 2)) translateY(0) rotate(0deg);
      opacity: 1;
    }
    30% {
      transform: translateX(calc(var(--index) * 2.5))
        translateY(calc(var(--index) * 1.5)) rotate(-10deg);
      opacity: 1;
    }
    45% {
      transform: translateX(calc(var(--index) * 1.5))
        translateY(calc(var(--index) * 2.5)) rotate(5deg);
      opacity: 0.9;
    }
    60% {
      transform: translateX(calc(var(--index) * 3))
        translateY(calc(var(--index) * 3)) rotate(-5deg);
      opacity: 1;
    }
    85% {
      transform: translateX(calc(var(--index) * 2.2))
        translateY(calc(var(--index) * 1)) rotate(-8deg);
      opacity: 0.9;
    }
  }
</style>
