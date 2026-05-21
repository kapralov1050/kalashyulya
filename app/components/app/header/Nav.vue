<template>
  <nav class="hidden grow lg:block">
    <ul class="flex items-center gap-x-8">
      <li>
        <UButton color="neutral" variant="link" to="/">
          {{ printLocale('header_about') }}
        </UButton>
      </li>
      <li>
        <UButton
          color="neutral"
          variant="link"
          to="/calendar"
          :prefetch="false"
        >
          {{ printLocale('header_calendar') }}
        </UButton>
      </li>
      <li>
        <UButton
          color="neutral"
          variant="link"
          to="/exhibitions"
          :prefetch="false"
        >
          {{ printLocale('header_exhibition') }}
        </UButton>
      </li>
      <li class="mr-auto">
        <UButton color="neutral" variant="link" to="/shop" :prefetch="false">
          {{ printLocale('header_shop') }}
        </UButton>
      </li>
      <li>
        <UButton color="neutral" variant="link" to="/basket">
          <AppBasketWidget />
        </UButton>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
  const { printLocale } = useLocales()
</script>

<style scoped lang="scss"></style>
