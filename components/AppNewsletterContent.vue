<template>
  <div class="container">
    <form class="flex justify-center gap-x-2">
      <AppFormField
        id="name"
        v-model="email"
        type="text"
        placeholder="Введите ваше имя"
        label="Имя"
        class="w-70% sm:w-96"
      />

      <UButton icon="heroicons:paper-airplane">
        <span class="hidden sm:inline">
          {{ $t('mainpage.emailSubscribe') }}
        </span>
      </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
  import AppFormField from './AppFormField.vue'

  const email = ref('')
</script>

<style scoped lang="scss"></style>
