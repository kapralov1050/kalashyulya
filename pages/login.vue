<template>
  <form class="flex flex-col gap-y-4 sm:gap-y-6">
    <AppFormField id="email" type="text">Email</AppFormField>
    <AppFormField id="password" type="text">Password</AppFormField>
    <AppButton class="mt-2 sm:mt-1">Log in</AppButton>
  </form>
  <p class="mt-6 text-center text-sm text-gray-600 sm:mt-8 dark:text-gray-300">
    Don't have an account?
    <NuxtLink
      to="/register"
      class="font-medium text-indigo-600 hover:text-indigo-700
        dark:text-indigo-400 dark:hover:text-indigo-300"
    >
      Sign Up
    </NuxtLink>
  </p>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'auth',
  })
</script>

<style scoped lang="scss"></style>
