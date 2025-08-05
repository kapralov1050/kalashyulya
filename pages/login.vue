<template>
  <UForm
    :schema="loginSchema"
    :state="userData"
    class="space-y-3 sm:space-y-5"
    @submit="onSubmit"
  >
    <UFormField label="Email" name="email">
      <UInput
        v-model="userData.email"
        size="xl"
        type="email"
        placeholder="Введите Email"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Password" name="password">
      <UInput
        v-model="userData.password"
        size="xl"
        type="text"
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
      Log in
    </UButton>
  </UForm>
</template>

<script setup lang="ts">
  import { loginUser } from '~/helpers/firebase/authService'
  import { showToast } from '~/helpers/showToast'
  import type { FormSubmitEvent } from '@nuxt/ui'
  import { loginSchema } from '~/helpers/valibot'
  import type { loginSchemaType } from '~/helpers/valibot'

  definePageMeta({
    layout: 'auth',
  })

  const userData = reactive({
    email: '',
    password: '',
  })

  const router = useRouter()

  const onSubmit = async (event: FormSubmitEvent<loginSchemaType>) => {
    const { user, error } = await loginUser(userData.email, userData.password)

    if (user) {
      showToast(
        'Успешно!',
        'User logged in successfully',
        'heroicons:exclamation-circle',
      )
      await setTimeout(() => {}, 1500)
      router.push('/lessons')
    }

    if (error) {
      showToast('Ошибка', error, 'heroicons:exclamation-circle')
    }
  }
</script>

<style scoped lang="scss"></style>
