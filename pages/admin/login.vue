<template>
  <form class="flex flex-col gap-y-4 sm:gap-y-6">
    <h1 class="text-center">Администратор</h1>
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
  import { useFirebase } from '~/composables/firebase/useFirebase'
  import { showToast } from '~/helpers/showToast'

  definePageMeta({
    layout: 'auth',
  })

  const email = ref('')
  const password = ref('')

  const { login } = useFirebase()
  const router = useRouter()

  const logInAdminPanel = async () => {
    const admin = await login(email.value, password.value)

    if (admin) {
      router.push('/admin/dashboard')
    } else {
      router.push('/')
      showToast(
        'Ошибка доступа',
        'Доступ запрещен',
        'heroicons:exclamation-triangle',
      )
    }
  }
</script>

<style scoped lang="scss"></style>
