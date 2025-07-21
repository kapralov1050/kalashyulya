<template>
  <UApp>
    <div class="flex min-h-screen flex-col dark:bg-gray-800">
      <AppHeader />
      <main>
        <slot />
      </main>
      <AppFooter />
    </div>
  </UApp>
</template>
