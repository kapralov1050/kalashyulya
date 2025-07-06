<template>
  <div class="container">
    <form class="flex justify-center gap-x-2">
      <AppFormField
        id="email"
        type="email"
        :placeholder="$t('mainpage.emailFieldText')"
        class="w-60 sm:w-96"
      />
      <AppButton icon="heroicons:paper-airplane">
        <span class="hidden sm:inline">
          {{ $t('mainpage.emailSubscribe') }}
        </span>
      </AppButton>
    </form>
  </div>
</template>

<script setup lang="ts">
  import AppFormField from './AppFormField.vue'
</script>

<style scoped lang="scss"></style>
