<template>
  <div class="justify-end flex lg:hidden">
    <UButton
      class="z-20 text-3xl"
      variant="link"
      color="neutral"
      :icon="isOpen ? 'heroicons:x-mark-16-solid' : 'heroicons:bars-3-16-solid'"
      @click="handleClick"
    />
    <div
      class="header bg-primary dark:bg-neutral-800 absolute z-13 left-0 w-[100%]
        min-h-[35vh] rounded-2xl"
    />
    <div class="menu absolute top-4 left-4 z-14">
      <ul>
        <li>
          <UButton
            class="text-2xl text-neutral-200 hover:text-white"
            color="neutral"
            variant="link"
            to="/"
          >
            {{ $t('header.about') }}
          </UButton>
        </li>
        <li>
          <UButton
            class="text-2xl text-neutral-200 hover:text-white"
            color="neutral"
            variant="link"
            to="/lessons"
          >
            {{ $t('header.navLessons') }}
          </UButton>
        </li>
        <li>
          <UButton
            class="text-2xl text-neutral-200 hover:text-white"
            color="neutral"
            variant="link"
            to="/shop"
          >
            {{ $t('header.shop') }}
          </UButton>
        </li>
        <li>
          <UButton
            v-for="locale in availableLocales"
            :key="locale.code"
            class="text-2xl text-neutral-200 hover:text-white ml-2 mt-10"
            variant="outline"
            :to="switchLocalePath(locale.code)"
          >
            {{ locale.name }}
          </UButton>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
  import gsap from 'gsap'

  const { locale, locales } = useI18n()
  const switchLocalePath = useSwitchLocalePath()

  const availableLocales = computed(() => {
    return locales.value.filter(i => i.code !== locale.value)
  })

  let tl
  const isOpen = shallowRef(false)
  const handleClick = () => {
    isOpen.value = !isOpen.value

    if (isOpen.value) {
      tl.play()
    } else {
      tl.reverse()
    }
  }

  onMounted(() => {
    tl = gsap.timeline({ paused: true, reversed: true })

    tl.fromTo(
      '.header',
      {
        opacity: 0,
        rotation: 90,
        y: -50,
        transformOrigin: '100% 0%',
      },
      {
        opacity: 1,
        rotation: 0,
        y: -50,
        transformOrigin: '100% 0%',
        ease: 'power3.out',
      },
    ).fromTo(
      '.menu',
      {
        x: -300,
      },
      { x: 0, ease: 'power3.out', duration: 0.2 },
    )
  })
</script>

<style></style>
