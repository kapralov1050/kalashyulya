<template>
  <form class="flex flex-col gap-y-4 sm:gap-y-6">
    <AppFormField id="email" v-model="email" placeholder="Введите Email">
      Email
    </AppFormField>
    <AppFormField id="password" v-model="password" placeholder="Введите пароль">
      Password
    </AppFormField>
    <AppButton
      icon="heroicons:paper-airplane"
      class="mt-2 sm:mt-1"
      @click.prevent="logInAdminPanel"
    >
      Log in
    </AppButton>
  </form>
</template>

<script setup lang="ts">
  import { set } from 'firebase/database'
  import { isAdmin, loginUser } from '~/helpers/firebase/authService'
  import { showToast } from '~/helpers/showToast'

  definePageMeta({
    layout: 'auth',
  })

  const email = ref('')
  const password = ref('')

  const router = useRouter()

  const logInAdminPanel = async () => {
    const { user, error } = await loginUser(email.value, password.value)

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
