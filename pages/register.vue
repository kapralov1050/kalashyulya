<template>
  <UForm
    :schema="registerSchema"
    :state="userData"
    class="space-y-3 sm:space-y-5"
    @submit="onSubmit"
  >
    <UFormField label="Имя" name="name">
      <UInput
        v-model="userData.name"
        size="xl"
        type="text"
        placeholder="Введите ваше имя"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Электронная почта" name="email">
      <UInput
        v-model="userData.email"
        size="xl"
        type="password"
        placeholder="Введите Email"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Пароль" name="password">
      <UInput
        v-model="userData.password"
        size="xl"
        type="password"
        placeholder="Введите пароль"
        class="w-full"
      />
    </UFormField>
    <UButton
      type="submit"
      size="xl"
      icon="heroicons:paper-airplane"
      class="mt-2 sm:mt-1 w-full flex justify-center"
    >
      Зарегистрироваться
    </UButton>
  </UForm>
  <p class="mt-6 text-center text-sm text-gray-600 sm:mt-8 dark:text-gray-300">
    Уже есть аккаунт?
    <NuxtLink
      class="cursor-pointer font-medium text-primary-600 hover:text-primary-700
        dark:text-primary-400 dark:hover:text-primary-300"
    >
      Войти
    </NuxtLink>
  </p>
</template>

<script setup lang="ts">
  import { createUser } from '~/helpers/firebase/authService'
  import { showToast } from '~/helpers/showToast'
  import { registerSchema } from '~/helpers/valibot'
  import type { registerSchemaType } from '~/helpers/valibot'
  import type { FormSubmitEvent } from '@nuxt/ui'

  definePageMeta({
    layout: 'auth',
  })

  const userData = reactive({
    name: '',
    email: '',
    password: '',
  })

  const onSubmit = async (_event: FormSubmitEvent<registerSchemaType>) => {
    const { user, error } = await createUser(
      userData.name,
      userData.email,
      userData.password,
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

    userData.name = ''
    userData.email = ''
    userData.password = ''
  }
</script>

<style scoped lang="scss"></style>
