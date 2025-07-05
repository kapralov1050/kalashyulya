<template>
  <nav class="hidden grow sm:block">
    <ul class="flex items-center gap-x-8">
      <li class="mr-auto">
        <AppHeaderNavLink to="/playlists">
          {{ $t('header.navLessons') }}
        </AppHeaderNavLink>
      </li>
      <li>
        <AppHeaderNavLink to="/login">
          {{ $t('header.login') }}
        </AppHeaderNavLink>
      </li>
      <li>
        <AppButton to="/register">
          {{ $t('header.registration') }}
        </AppButton>
      </li>
      <li>
        <AppHeaderNavLink
          v-for="locale in availableLocales"
          :key="locale.code"
          :to="switchLocalePath(locale.code)"
        >
          {{ locale.name }}
        </AppHeaderNavLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
  const { locale, locales } = useI18n()
  const switchLocalePath = useSwitchLocalePath()

  const availableLocales = computed(() => {
    return locales.value.filter(i => i.code !== locale.value)
  })
</script>

<style scoped lang="scss"></style>
