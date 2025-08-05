<template>
  <div class="flex min-h-screen flex-col dark:bg-gray-800">
    <UApp>
      <AppHeader />
      <slot />
      <AppFooter />
    </UApp>
  </div>
</template>
