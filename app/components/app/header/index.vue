<template>
  <header
    :class="[
      fixed ? 'fixed' : 'sticky',
      'inset-x-0 top-0 border-b border-neutral-200 bg-white',
      'dark:border-neutral-800 dark:bg-neutral-900',
    ]"
  >
    <div class="container flex h-(--header-height) items-center gap-x-10">
      <AppLogo />
      <AppHeaderNav class="ml-auto" />
      <div class="ml-auto flex items-center gap-x-1 lg:ml-0">
        <AppHeaderThemeSwitch />
        <AppBasketWidget />
        <AppHeaderMobileNav />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  defineProps<{
    fixed?: boolean
  }>()
</script>
