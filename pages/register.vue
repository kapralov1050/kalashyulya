<template>
  <form class="flex flex-col gap-y-4 sm:gap-y-6">
    <AppFormField id="name" v-model="name" placeholder="Введите ваше Имя">
      Name
    </AppFormField>
    <AppFormField id="email" v-model="email" placeholder="Введите Email">
      Email
    </AppFormField>
    <AppFormField id="password" v-model="password" placeholder="Введите пароль">
      Password
    </AppFormField>
    <AppFormField
      id="password"
      v-model="passwordConfirm"
      placeholder="Подтвердите пароль"
    >
      Password Confirmation
    </AppFormField>
    <AppButton
      icon="heroicons:paper-airplane"
      class="mt-2 sm:mt-1"
      @click.prevent="register"
    >
      Sign Up
    </AppButton>
  </form>
  <p class="mt-6 text-center text-sm text-gray-600 sm:mt-8 dark:text-gray-300">
    Already have an account?
    <NuxtLink
      class="font-medium text-indigo-600 hover:text-indigo-700
        dark:text-indigo-400 dark:hover:text-indigo-300"
    >
      Log in
    </NuxtLink>
  </p>
</template>

<script setup lang="ts">
  import { createUser } from '~/helpers/firebase/authService'
  import { showToast } from '~/helpers/showToast'

  definePageMeta({
    layout: 'auth',
  })

  const name = ref('')
  const email = ref('')
  const password = ref('')
  const passwordConfirm = ref('')

  const register = async () => {
    const { user, error } = await createUser(
      name.value,
      email.value,
      password.value,
    )

    if (user) {
      showToast(
        'Успешно!',
        'User created successfully',
        'heroicons:check-circle',
      )
      navigateTo('/')
    }

    if (error) {
      showToast('Ошибка', error, 'heroicons:exclamation-circle')
    }

    email.value = ''
    password.value = ''
    passwordConfirm.value = ''
  }
</script>

<style scoped lang="scss"></style>
