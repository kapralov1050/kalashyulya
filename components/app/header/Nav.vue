<template>
  <nav class="hidden grow lg:block">
    <ul class="flex items-center gap-x-8">
      <li>
        <UButton color="neutral" variant="link" to="/">
          {{ $t('header.about') }}
        </UButton>
      </li>
      <li>
        <UButton color="neutral" variant="link" to="/lessons">
          {{ $t('header.navLessons') }}
        </UButton>
      </li>

      <li class="mr-auto">
        <UButton color="neutral" variant="link" to="/shop">
          {{ $t('header.shop') }}
        </UButton>
      </li>
      <li>
        <USwitch
          v-model="isDark"
          color="neutral"
          unchecked-icon="heroicons:sun"
          checked-icon="heroicons:moon"
          size="xl"
          @click="mode = mode === 'light' ? 'dark' : 'light'"
        />
      </li>
      <li>
        <UButton color="neutral" variant="link" to="/basket">
          <UIcon name="heroicons:shopping-cart" size="2rem" />
        </UButton>
      </li>
      <li>
        <UButton color="neutral" variant="link" to="/admin/dashboard">
          <UIcon name="heroicons:user" size="2rem" />
        </UButton>
      </li>
      <!-- <li>
        <UButton color="neutral" variant="link" to="/login">
          {{ $t('header.login') }}
        </UButton>
      </li>
      <li>
        <UButton to="/register" size="xl" color="neutral" variant="outline">
          {{ $t('header.registration') }}
        </UButton>
      </li> -->
      <li>
        <UButton
          v-for="locale in availableLocales"
          :key="locale.code"
          color="neutral"
          variant="link"
          :to="switchLocalePath(locale.code)"
        >
          {{ locale.name }}
        </UButton>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
  import { useColorMode } from '@vueuse/core'

  const { locale, locales } = useI18n()
  const switchLocalePath = useSwitchLocalePath()

  const availableLocales = computed(() => {
    return locales.value.filter(i => i.code !== locale.value)
  })

  const mode = useColorMode()

  const isDark = computed(() => {
    return mode.value === 'dark'
  })
</script>

<style scoped lang="scss"></style>
