<template>
  <div class="container">
    <form class="flex justify-center items-end gap-x-2">
      <AppFormField
        id="name"
        v-model="email"
        type="text"
        placeholder="Введите ваше Email"
        class="w-70% sm:w-96"
      />

      <UButton icon="heroicons:paper-airplane" size="lg" @click="sendEmail">
        {{ $t('mainpage.emailSubscribe') }}
      </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
  const email = ref('')

  const sendEmail = async () => {
    try {
      await useNewsletter().sendEmail(email.value)
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }
</script>

<style scoped lang="scss"></style>
