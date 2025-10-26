<template>
  <nav class="hidden grow lg:block">
    <ul class="flex items-center gap-x-8">
      <li>
        <UButton color="neutral" variant="link" to="/">
          {{ printLocale('header_about') }}
        </UButton>
      </li>
      <li>
        <UButton color="neutral" variant="link" to="/lessons">
          {{ printLocale('header_navLessons') }}
        </UButton>
      </li>
      <li class="mr-auto">
        <UButton color="neutral" variant="link" to="/shop">
          {{ printLocale('header_shop') }}
        </UButton>
      </li>
      <li>
        <UButton color="neutral" variant="link" to="/basket">
          <UIcon name="heroicons:shopping-cart" size="2rem" />
        </UButton>
      </li>
      <li>
        <UButton
          v-if="currentUser && currentUser.uid"
          color="neutral"
          variant="link"
          :to="`/profile/${currentUser.uid}`"
        >
          <UIcon name="heroicons:user" size="2rem" />
        </UButton>
      </li>
      <li>
        <UButton v-if="!currentUser" color="neutral" variant="link" to="/login">
          {{ $t('header.login') }}
        </UButton>
      </li>
      <li>
        <UButton
          v-if="!currentUser"
          to="/register"
          size="xl"
          color="neutral"
          variant="outline"
        >
          {{ $t('header.registration') }}
        </UButton>
      </li>
      <!-- <li>
        <UButton
          v-for="locale in availableLocales"
          :key="locale.code"
          color="neutral"
          variant="link"
          :to="switchLocalePath(locale.code)"
        >
          {{ locale.name }}
        </UButton>
      </li> -->
    </ul>
  </nav>
</template>

<script setup lang="ts">
  const { locale, locales } = useI18n()
  const switchLocalePath = useSwitchLocalePath()

  const availableLocales = computed(() => {
    return locales.value.filter(i => i.code !== locale.value)
  })

  const { printLocale } = useLocales()
  const { currentUser } = storeToRefs(useAuthStore())
</script>

<style scoped lang="scss"></style>
