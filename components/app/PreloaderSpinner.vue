<template>
  <div class="preloader-container">
    <div class="spinner"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
  .preloader-container {
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    background-color: #ffffff;
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
    background-image: url(/preloader.webp);
    background-size: cover;
    animation: fade 2s ease;
  }

  .spinner::after {
    position: fixed;
    content: '';
    width: calc(var(--index) * 2);
    height: calc(var(--index) * 2);
    background-image: url(/brush.webp);
    background-size: cover;
    animation: brush 2s ease;
    will-change: transform;
  }

  @keyframes fade {
    0% {
      opacity: 1;
    }
    75% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes brush {
    0% {
      transform: translateX(calc(var(--index) * 2));
    }
    75% {
      transform: translateY(calc(var(--index) * 5))
        translateX(calc(var(--index) * 3));
    }
    100% {
      transform: translateY(calc(var(--index) * 3))
        translateX(calc(var(--index) * 2.5));
    }
  }
</style>
